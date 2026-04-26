self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

let notifTimer = null;

self.addEventListener('message', e => {
    if (e.data && e.data.type === 'PLANIFIER_NOTIF') {
        if (notifTimer) clearTimeout(notifTimer);
        
        const maintenant = Date.now();
        const cible = e.data.timestamp;
        const delai = cible - maintenant;
        
        if (delai > 0) {
            notifTimer = setTimeout(() => {
                self.registration.showNotification('Fée du logis en approche ! 🧚', {
                    body: 'Tes créatures t\'attendent ✨',
                    icon: '/logo512.png',
                    vibrate: [200, 100, 200]
                });
            }, delai);
        }
    }
});