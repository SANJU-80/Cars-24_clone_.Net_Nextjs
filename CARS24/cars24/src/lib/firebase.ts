import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp | undefined;
if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      // Check if config has placeholder values
      const hasPlaceholders = 
        firebaseConfig.apiKey === "YOUR_API_KEY" ||
        firebaseConfig.projectId === "YOUR_PROJECT_ID";
      
      if (!hasPlaceholders) {
        app = initializeApp(firebaseConfig);
      } else {
        console.warn('Firebase not configured. Using placeholder values. Push notifications will not work.');
      }
    } else {
      app = getApps()[0];
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    app = undefined;
  }
}

// Get FCM token
export const getFCMToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !app) {
    return null;
  }

  try {
    const messaging = getMessaging(app);
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    
    // Check if VAPID key is configured
    if (!vapidKey || vapidKey === "YOUR_VAPID_KEY" || vapidKey.trim() === "") {
      console.warn('Firebase VAPID key is not configured. Push notifications will not work.');
      return null;
    }
    
    const currentToken = await getToken(messaging, { vapidKey });
    
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err: any) {
    // Handle specific VAPID key errors gracefully
    if (err?.code === 'messaging/invalid-vapid-key' || err?.message?.includes('applicationServerKey')) {
      console.warn('Invalid VAPID key. Please configure NEXT_PUBLIC_FIREBASE_VAPID_KEY in your .env.local file.');
      return null;
    }
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !app) {
      // Resolve with null if not in browser or app not initialized
      resolve(null);
      return;
    }

    try {
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        resolve(payload);
      });
    } catch (error) {
      // If Firebase messaging fails, resolve with null instead of rejecting
      console.warn('Firebase messaging not available:', error);
      resolve(null);
    }
  });
};

export default app;

