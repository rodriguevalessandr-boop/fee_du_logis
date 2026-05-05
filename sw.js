self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

let notifTimer = null;

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PLANIFIER_NOTIF') {
        const delai = event.data.timestamp - Date.now();

        if (delai > 0) {
            // waitUntil dit au navigateur : "Ne me tue pas tout de suite, j'ai un truc à faire"
            event.waitUntil(
                new Promise((resolve) => {
                    setTimeout(() => {
                        self.registration.showNotification('Fée du Logis 🧚', {
                            body: "Petite fée du Logis en approche ! ✨",
                            icon: 'logo512.jpg',
                            vibrate: [200, 100, 200],
                            badge: 'logo512.jpg',
                            tag: 'rappel-quotidien' // Évite les doublons
                        });
                        resolve();
                    }, delai);
                })
            );
        }
    }
});

// Gérer le clic sur la notification pour ouvrir l'app
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