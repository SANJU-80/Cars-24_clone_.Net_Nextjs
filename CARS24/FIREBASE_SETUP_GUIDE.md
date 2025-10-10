# Firebase Setup Guide for Push Notifications

## Overview
The CARS24 application includes push notification functionality using Firebase Cloud Messaging (FCM). This guide explains how to set up Firebase for push notifications.

## Current Status
The app is configured to work **without Firebase** - if Firebase is not configured, the app will continue to work normally but push notifications will be disabled.

## Firebase Configuration (Optional)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable "Cloud Messaging" in the project

### 2. Get Configuration Values
1. Go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app and get the configuration values

### 3. Get VAPID Key
1. Go to Project Settings > Cloud Messaging
2. Scroll down to "Web Push certificates"
3. Generate a new key pair or use existing one
4. Copy the "Key pair" value

### 4. Environment Variables
Create a `.env.local` file in the `cars24` directory with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key-here
```

### 5. Service Worker
The app includes a service worker file at `public/firebase-messaging-sw.js` for handling background notifications.

## Error Handling
The app gracefully handles Firebase errors:
- If VAPID key is invalid: Falls back to getting token without VAPID
- If Firebase is not configured: App continues without push notifications
- If permission is denied: App continues without push notifications

## Testing
1. With Firebase configured: Users will receive push notifications
2. Without Firebase configured: App works normally, notifications are disabled

## Troubleshooting
- **"Invalid applicationServerKey"**: Check your VAPID key in environment variables
- **"Firebase messaging not available"**: Ensure you're running on HTTPS or localhost
- **"No registration token"**: Check browser notification permissions

## Production Deployment
For production, ensure:
1. Firebase project is properly configured
2. Environment variables are set in your deployment platform
3. HTTPS is enabled (required for push notifications)
4. Service worker is accessible at `/firebase-messaging-sw.js`