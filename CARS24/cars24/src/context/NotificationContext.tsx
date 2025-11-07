"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as notificationApi from "@/lib/notificationapi";
import { getFCMToken, requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import { toast } from "sonner";

type Notification = {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, string>;
};

type NotificationPreferences = {
  appointmentConfirmations: boolean;
  bidUpdates: boolean;
  priceDrops: boolean;
  newMessages: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  registerToken: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Register FCM token
  const registerToken = useCallback(async () => {
    if (!user?.id) return;

    try {
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        console.log("Notification permission denied");
        return;
      }

      // Register service worker
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          console.log("Service Worker registered:", registration);
        } catch (error) {
          console.warn("Service Worker registration failed (this is normal if Firebase is not configured):", error);
        }
      }

      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
        try {
          await notificationApi.registerFCMToken(user.id, token);
          console.log("FCM token registered successfully");
        } catch (error) {
          console.warn("Failed to register FCM token with backend (backend may not be running):", error);
        }
      } else {
        console.log("FCM token not available (Firebase may not be configured)");
      }
    } catch (error) {
      console.warn("Error registering FCM token (this is normal if Firebase is not configured):", error);
    }
  }, [user?.id]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [notificationsData, unreadData, prefsData] = await Promise.all([
        notificationApi.getUserNotifications(user.id),
        notificationApi.getUnreadCount(user.id),
        notificationApi.getNotificationPreferences(user.id),
      ]);

      setNotifications(notificationsData || []);
      setUnreadCount(unreadData?.count || 0);
      setPreferences(prefsData || null);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;

      try {
        await notificationApi.markNotificationAsRead(notificationId, user.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [user?.id]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await notificationApi.markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [user?.id]);

  // Update preferences
  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      if (!user?.id) return;

      try {
        await notificationApi.updateNotificationPreferences(user.id, prefs);
        setPreferences((prev) => (prev ? { ...prev, ...prefs } : null));
        toast.success("Notification preferences updated");
      } catch (error) {
        console.error("Error updating preferences:", error);
        toast.error("Failed to update preferences");
      }
    },
    [user?.id]
  );

  // Initialize: register token and load notifications when user logs in
  useEffect(() => {
    if (user?.id) {
      registerToken();
      refreshNotifications();

      // Set up foreground message listener
      onMessageListener()
        .then((payload: any) => {
          if (payload) {
            console.log("Foreground message received:", payload);
            toast.info(payload.notification?.title || payload.data?.title, {
              description: payload.notification?.body || payload.data?.body,
            });
            refreshNotifications();
          }
        })
        .catch((err) => {
          // Silently handle errors - Firebase may not be configured
          console.warn("Message listener not available:", err);
        });

      // Refresh notifications every 30 seconds
      const interval = setInterval(refreshNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setPreferences(null);
    }
  }, [user?.id, registerToken, refreshNotifications]);

  // Clean up token on logout
  useEffect(() => {
    if (!user?.id && fcmToken) {
      // Token cleanup would happen here if we had userId
      setFcmToken(null);
    }
  }, [user?.id, fcmToken]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        updatePreferences,
        registerToken,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

