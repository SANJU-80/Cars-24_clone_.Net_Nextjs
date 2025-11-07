# Firebase Cloud Messaging Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in the CARS24 application.

## Prerequisites

1. A Firebase account
2. A Firebase project created

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Add Web App to Firebase

1. In your Firebase project, click the web icon (`</>`)
2. Register your app with a nickname (e.g., "CARS24 Web")
3. Copy the Firebase configuration object

### 3. Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** > **Cloud Messaging**
2. Under "Web configuration", click "Generate key pair" to create a VAPID key
3. Copy the VAPID key (you'll need this for the frontend)

### 4. Configure Frontend Environment Variables

Create a `.env.local` file in the `cars24` directory with the following:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 5. Update Service Worker

Update `public/firebase-messaging-sw.js` with your Firebase config values:

```javascript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

**Note:** Service workers can't access environment variables directly. You'll need to either:
- Hardcode the values (for development)
- Use a build-time script to inject them
- Fetch the config from your API

### 6. Configure Backend (C# API)

1. Go to Firebase Console > **Project Settings** > **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Add the following to `appsettings.json`:

```json
{
  "Firebase": {
    "ConfigPath": "path/to/your/firebase-service-account.json"
  }
}
```

Or set the `Firebase:ServiceAccountJson` configuration with the JSON content as a string.

### 7. Install Dependencies

**Frontend:**
```bash
cd cars24
npm install
```

**Backend:**
The FirebaseAdmin NuGet package should be restored automatically when you build the project.

### 8. Test Notifications

1. Start both frontend and backend servers
2. Log in to the application
3. Allow notification permissions when prompted
4. Create an appointment or booking to test notifications

## Notification Types

The system supports the following notification types:

- **Appointment Confirmations**: Sent when appointments are created or confirmed
- **Bid Updates**: Sent when bids are placed or updated (if bidding is implemented)
- **Price Drops**: Sent when car prices decrease
- **New Messages**: Sent when new messages are received (if messaging is implemented)

## User Preferences

Users can customize their notification preferences by:
1. Going to Profile > Notification Preferences
2. Toggling individual notification types on/off
3. Enabling/disabling push notifications entirely

## Troubleshooting

### Notifications not working?

1. **Check browser permissions**: Ensure notifications are allowed in browser settings
2. **Check service worker**: Verify `firebase-messaging-sw.js` is registered
3. **Check FCM token**: Look for token registration in browser console
4. **Check Firebase config**: Verify all environment variables are set correctly
5. **Check backend logs**: Look for Firebase initialization errors

### Service Worker not registering?

1. Ensure `firebase-messaging-sw.js` is in the `public` folder
2. Check browser console for service worker registration errors
3. Verify HTTPS is used (required for service workers in production)

### Backend not sending notifications?

1. Verify Firebase service account JSON is configured correctly
2. Check that `NotificationService` is registered in `Program.cs`
3. Look for Firebase initialization errors in backend logs

## Security Notes

- Never commit Firebase service account keys to version control
- Use environment variables for all sensitive configuration
- Restrict Firebase API keys to your domain in Firebase Console
- Regularly rotate service account keys

