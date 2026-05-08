// sw.js (Version améliorée)

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PLANIFIER_NOTIF') {
        const delai = event.data.timestamp - Date.now();

        if (delai > 0) {
            console.log(`Rappel programmé dans ${Math.round(delai/1000/60)} minutes.`);
            
            // On utilise une promesse pour s'assurer que le navigateur voit l'activité
            const notificationPromise = new Promise((resolve) => {
                setTimeout(() => {
                    self.registration.showNotification('Fée du Logis 🧚', {
                        body: "C'est l'heure de s'occuper du sanctuaire ! ✨",
                        icon: 'logo512.jpg',
                        vibrate: [200, 100, 200],
                        badge: 'logo512.jpg',
                        tag: 'rappel-quotidien',
                        renotify: true,
                        // Ajout d'actions pour rendre la notif interactive
                        actions: [
                            { action: 'ouvrir', title: 'Voir mes tâches' }
                        ]
                    }).then(resolve);
                }, delai);
            });

            event.waitUntil(notificationPromise);
        }
    }
});