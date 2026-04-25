self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

// Écoute les ordres envoyés par l'application (app.js)
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'DECLENCHER_NOTIF') {
    self.registration.showNotification('Fée du logis ✨', {
      body: e.data.message,
      icon: '/logo512.png', // Assure-toi d'avoir une icône à ce nom !
      vibrate: [200, 100, 200],
      badge: '/logo512.png'
    });
  }
});