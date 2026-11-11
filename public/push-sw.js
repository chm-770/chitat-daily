/* Reminder notifications (sent by the worker through Firebase Cloud Messaging). */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = {};
  }
  const d = payload.data || payload;
  const title = d.title || 'חת״ת יומי';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: d.body || '',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      dir: 'rtl',
      lang: 'he',
      tag: d.tag || undefined,
      data: { url: d.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          return client.navigate(url).then((c) => (c || client).focus()).catch(() => client.focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
