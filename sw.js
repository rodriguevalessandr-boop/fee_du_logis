self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

let notifTimer = null;

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PLANIFIER_NOTIF') {
        // On annule le précédent rappel s'il y en avait un
        if (notifTimer) clearTimeout(notifTimer);

        const delai = event.data.timestamp - Date.now();

        if (delai > 0) {
            notifTimer = setTimeout(() => {
                self.registration.showNotification('Fée du Logis 🧚', {
                    body: "Petite fée du Logis en approche ! ✨",
                    icon: 'logo512.jpg', // Assure-toi d'avoir une icône ou retire cette ligne
                    vibrate: [200, 100, 200],
                    badge: 'logo512.jpg'
                });
                
                // Optionnel : reprogrammer automatiquement pour le lendemain
                // postMessage({type: 'REPLANIFIER_DEMAIN'}); 
            }, delai);
        }
    }
});

// Gérer le clic sur la notification pour ouvrir l'app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/') 
    );
});