// Service Worker for Bankroll Push Notifications

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Bankroll',
      body: event.data.text(),
    };
  }

  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    tag: notificationData.tag || 'bankroll-notification',
    renotify: true,
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    
    // Visual options
    image: notificationData.image,
    
    // Styling
    dir: 'ltr',
    lang: 'en-US',
    
    // Behavior
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Bankroll Notification',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  
  event.notification.close();

  const clickAction = event.action || event.notification.data?.action || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url.includes('bankroll.live') && 'focus' in client) {
            client.focus();
            client.navigate(clickAction);
            return;
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(clickAction);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed');
  
  // Track notification dismissal if needed
  if (event.notification.data?.trackingId) {
    // Send analytics event
    fetch('/api/notifications/dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: event.notification.data.trackingId,
        timestamp: Date.now(),
      }),
    }).catch(console.error);
  }
});

// Background sync for failed notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    // Fetch any pending notifications
    const response = await fetch('/api/notifications/pending');
    const notifications = await response.json();
    
    // Show any pending notifications
    for (const notification of notifications) {
      await self.registration.showNotification(notification.title, notification.options);
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}