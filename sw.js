self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PLANIFIER_NOTIF') {
        const delai = event.data.timestamp - Date.now();

        if (delai > 0) {
            console.log(`Rappel programmé dans ${Math.round(delai/1000/60)} minutes.`);
            
            // Le secret : event.waitUntil force le SW à rester "vivant"
            event.waitUntil(
                new Promise((resolve) => {
                    setTimeout(() => {
                        self.registration.showNotification('Fée du Logis 🧚', {
                            body: "C'est l'heure de s'occuper du sanctuaire ! ✨",
                            icon: 'logo512.jpg',
                            vibrate: [200, 100, 200],
                            badge: 'logo512.jpg',
                            tag: 'rappel-quotidien',
                            renotify: true
                        });
                        resolve();
                    }, delai);
                })
            );
        }
    }
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});