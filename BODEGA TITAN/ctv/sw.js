/* Service worker de Cierra tu Venta: solo notificaciones (no guarda la app en caché). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { cuerpo: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.titulo || 'Cierra tu Venta', {
    body: d.cuerpo || 'Mensaje nuevo', icon: 'img/icono-192.png', badge: 'img/icono-192.png',
    tag: d.tag || undefined, renotify: true, data: { chat: d.chat || null },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const chat = e.notification.data && e.notification.data.chat;
  e.waitUntil((async () => {
    const lista = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of lista) { if ('focus' in c) { c.postMessage({ abrirChat: chat }); return c.focus(); } }
    const nueva = await self.clients.openWindow(self.registration.scope);
    // La app avisa cuando ya cargó ("listo") y ahí se le dice qué chat abrir
    if (nueva && chat) self.chatPendiente = chat;
    return nueva;
  })());
});
self.addEventListener('message', (e) => {
  if (e.data === 'listo' && self.chatPendiente && e.source) { e.source.postMessage({ abrirChat: self.chatPendiente }); self.chatPendiente = null; }
});
