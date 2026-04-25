self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

// Notification à 8h chaque jour
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'PLANIFIER_NOTIF') {
    const maintenant = new Date();
    const cible = new Date();
    cible.setHours(8, 0, 0, 0);
    if (cible <= maintenant) cible.setDate(cible.getDate() + 1);

    const delai = cible.getTime() - maintenant.getTime();
    setTimeout(() => {
      self.registration.showNotification('Fée du logis en approche !', {
        body: 'Tes créatures t\'attendent 🧚',
        icon: '/logo512.png',
        vibrate: [200, 100, 200]
      });
    }, delai);
  }
});