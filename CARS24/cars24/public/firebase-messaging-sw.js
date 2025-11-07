// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize Firebase
// Note: Replace these with your actual Firebase config values
// You can get these from your Firebase project settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// For production, you should inject these values at build time
// or fetch them from your API endpoint
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'CARS24';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.notificationId || 'cars24-notification',
    data: payload.data || {},
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const data = event.notification.data;
    let url = '/';
    
    // Handle deep linking based on notification type
    if (data?.type === 'appointment' && data?.relatedId) {
      url = `/appointments`;
    } else if (data?.type === 'price_drop' && data?.carId) {
      url = `/buy-car/${data.carId}`;
    } else if (data?.type === 'bid' && data?.relatedId) {
      url = `/buy-car/${data.relatedId}`;
    } else if (data?.type === 'message' && data?.relatedId) {
      url = `/messages`;
    }

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

