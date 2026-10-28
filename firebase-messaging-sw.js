/**
 * firebase-messaging-sw.js
 * Firebase Cloud Messaging Service Worker
 *
 * Handles BACKGROUND push notifications for the birthday website.
 * Runs even when the site tab is closed or minimised.
 *
 * Project: birthday-message-bot
 */

// ─── Import Firebase Compat Scripts ───────────────────────────────────────────
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// ─── Firebase Configuration ────────────────────────────────────────────────
// These are frontend-safe public identifiers (not server secrets).
const firebaseConfig = {
  apiKey:            "AIzaSyCegx4wZJy1xXFy7Z5gacVo1AoxcqpG_AM",
  authDomain:        "birthday-message-bot.firebaseapp.com",
  projectId:         "birthday-message-bot",
  storageBucket:     "birthday-message-bot.firebasestorage.app",
  messagingSenderId: "849039903031",
  appId:             "1:849039903031:web:a2863b96f571a31aa772b2",
  measurementId:     "G-E4VGG884WS"
};

// ─── Initialize Firebase ───────────────────────────────────────────────────
// Guard against re-initialization if the SW is reused across updates
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// ─── Assets ────────────────────────────────────────────────────────────────
const NOTIFICATION_ICON = '/images/WhatsApp%20Image%202026-10-27%20at%2011.43.57%20PM.jpeg';
const SITE_TITLE        = '🎂 Birthday Wish ✨';

// ─── Background Message Handler ────────────────────────────────────────────
// Fires when a push arrives while the page is in the background or closed.
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title || SITE_TITLE;
  const notificationOptions = {
    body:             payload.notification?.body  || 'Sending you love on your special day! 💙',
    icon:             payload.notification?.icon  || NOTIFICATION_ICON,
    badge:            NOTIFICATION_ICON,
    tag:              'birthday-wish',   // Replace any existing notification with same tag
    renotify:         true,              // Still alert even when replacing same tag
    requireInteraction: false,           // Auto-dismiss after a while
    data: {
      url: self.location.origin          // URL to open when notification is clicked
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ─── Raw Push Fallback ─────────────────────────────────────────────────────
// Safety net for non-FCM pushes or debugging. FCM's onBackgroundMessage
// handles FCM-format pushes; this catches anything else.
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { body: event.data.text() } };
  }

  // Skip if FCM already handled it (FCM sets google.c.a.e in data)
  if (payload?.data?.['google.c.a.e']) return;

  const title = payload?.notification?.title || SITE_TITLE;
  const options = {
    body:  payload?.notification?.body || 'A birthday wish just for you! 🎉',
    icon:  NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    tag:   'birthday-wish-raw',
    data:  { url: self.location.origin }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification Click Handler ────────────────────────────────────────────
// Opens (or focuses) the birthday website when the notification is clicked.
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || self.location.origin || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus an already-open tab if one exists
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});

// ─── Service Worker Lifecycle ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Birthday Bot Service Worker installing…');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Birthday Bot Service Worker activated.');
  event.waitUntil(clients.claim());
});
