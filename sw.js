self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'DECLENCHER_NOTIF') {
    self.registration.showNotification('Fée du logis ✨', {
      body: e.data.message,
      icon: '/logo512.png',
      vibrate: [200, 100, 200]
    });
  }
});