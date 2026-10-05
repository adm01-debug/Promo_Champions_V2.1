// Service Worker exclusivo para Web Push.
//
// Registrado em scope '/push/' (ver src/hooks/usePushNotifications.ts):
// NÃO intercepta fetch, NÃO usa Cache Storage e NÃO promete offline.
// O cache/offline do app é responsabilidade do `pwa-sw.js` gerado pelo
// vite-plugin-pwa (workbox), registrado em '/' — este arquivo existia antes
// com fetch handler e limpeza de caches que conflitavam com ele.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Nova Notificação', body: event.data.text() };
  }

  const title = payload.title || 'Nova Notificação';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      tag: payload.tag || 'notification',
      data: payload.data || { url: '/' },
      requireInteraction: payload.requireInteraction ?? false,
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate?.(targetUrl);
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
