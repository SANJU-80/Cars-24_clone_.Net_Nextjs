import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUserNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAsClicked,
  getUserPreferences,
  updateUserPreferences,
  registerFCMToken,
  unregisterFCMToken,
  Notification,
  UserNotificationPreferences
} from '@/lib/notificationapi';
import { 
  requestNotificationPermission, 
  onMessageListener, 
  registerServiceWorker 
} from '@/lib/firebase';
import { toast } from 'sonner';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: UserNotificationPreferences | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markNotificationAsClicked: (notificationId: string) => Promise<void>;
  updatePreferences: (preferences: UserNotificationPreferences) => Promise<void>;
  initializeNotifications: () => Promise<void>;
  
  // FCM
  fcmToken: string | null;
  isFCMInitialized: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isFCMInitialized, setIsFCMInitialized] = useState(false);

  // Initialize notifications and FCM
  const initializeNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Register service worker
      await registerServiceWorker();

      // Request notification permission and get FCM token
      try {
        const token = await requestNotificationPermission();
        if (token) {
          setFcmToken(token);
          
          // Register token with backend
          try {
            await registerFCMToken({
              userId: user.id,
              token: token,
              deviceType: 'web',
              deviceId: navigator.userAgent,
              userAgent: navigator.userAgent
            });
          } catch (registerError) {
            console.warn('Failed to register FCM token with backend:', registerError);
            // Continue without backend registration - notifications will still work locally
          }
        }
      } catch (fcmError) {
        console.warn('FCM initialization failed:', fcmError);
        // Continue without FCM - the app will still work without push notifications
      }

      // Load user preferences
      const userPreferences = await getUserPreferences(user.id);
      setPreferences(userPreferences);

      // Load notifications
      await refreshNotifications();

      // Set up foreground message listener
      onMessageListener().then((payload) => {
        console.log('Foreground message received:', payload);
        
        // Show toast notification
        toast.info(payload.notification?.title || 'New Notification', {
          description: payload.notification?.body,
          action: {
            label: 'View',
            onClick: () => {
              if (payload.data?.actionUrl) {
                window.location.href = payload.data.actionUrl;
              }
            }
          }
        });

        // Refresh notifications
        refreshNotifications();
      }).catch((error) => {
        console.error('Error setting up message listener:', error);
      });

      setIsFCMInitialized(true);
    } catch (error: any) {
      console.error('Error initializing notifications:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [notificationsData, unreadCountData] = await Promise.all([
        getUserNotifications(user.id, 1, 50),
        getUnreadCount(user.id)
      ]);

      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error: any) {
      console.error('Error refreshing notifications:', error);
      setError(error.message);
    }
  }, [user?.id]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      await markAsRead(notificationId, user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      setError(error.message);
    }
  }, [user?.id]);

  // Mark notification as clicked
  const markNotificationAsClicked = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      await markAsClicked(notificationId, user.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isClicked: true, clickedAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (error: any) {
      console.error('Error marking notification as clicked:', error);
      setError(error.message);
    }
  }, [user?.id]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences: UserNotificationPreferences) => {
    if (!user?.id) return;

    try {
      const updatedPreferences = await updateUserPreferences(user.id, newPreferences);
      setPreferences(updatedPreferences);
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      setError(error.message);
    }
  }, [user?.id]);

  // Initialize when user changes
  useEffect(() => {
    if (user?.id) {
      initializeNotifications();
    } else {
      // Clean up when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
      setFcmToken(null);
      setIsFCMInitialized(false);
    }
  }, [user?.id, initializeNotifications]);

  // Clean up FCM token on unmount
  useEffect(() => {
    return () => {
      if (fcmToken) {
        unregisterFCMToken(fcmToken).catch(console.error);
      }
    };
  }, [fcmToken]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    loading,
    error,
    refreshNotifications,
    markNotificationAsRead,
    markNotificationAsClicked,
    updatePreferences,
    initializeNotifications,
    fcmToken,
    isFCMInitialized
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
