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
                const options = {
                    body: "Tes créatures t'attendent pour le rituel ✨",
                    icon: 'logo512.jpg', // Vérifie bien que l'extension est .jpg ou .png
                    vibrate: [500, 110, 500, 110, 450, 110, 200, 110], 
                    data: { url: self.location.origin },
                    tag: 'alarme-fee',
                    renotify: true, // Fait vibrer même si une notif est déjà là
                    requireInteraction: true, // Reste affiché tant qu'on ne clique pas
                    badge: 'logo512.jpg' // Petite icône dans la barre de statut Android
                };

                self.registration.showNotification('Fée du logis en approche ! 🧚', options);
            }, delai);
        }
    }
});

// Action quand on clique sur la notification
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Si l'appli est déjà ouverte, on la remet au premier plan
            for (let client of windowClients) {
                if (client.url === e.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Sinon on l'ouvre
            if (clients.openWindow) {
                return clients.openWindow(e.notification.data.url);
            }
        })
    );
});