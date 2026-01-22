// NEON Energy Push Notification Service Worker

self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('[SW] Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/neon-icon-192.png',
      badge: data.badge || '/neon-badge-72.png',
      tag: data.tag || 'neon-notification',
      data: data.data || {},
      actions: data.actions || [],
      vibrate: [200, 100, 200],
      requireInteraction: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'NEON Energy', options)
    );
  } catch (error) {
    console.error('[SW] Error processing push event:', error);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  // Handle different actions
  let url = '/';
  
  if (action === 'view' || action === 'view-details') {
    url = data.url || '/portal';
  } else if (action === 'share') {
    // For share action, just open the portal
    url = '/portal';
  } else if (data.url) {
    url = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('notificationclose', function(event) {
  // Track notification dismissals if needed
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Handle service worker installation
self.addEventListener('install', function(event) {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', function(event) {
  console.log('[SW] Service Worker activated');
  event.waitUntil(clients.claim());
});
