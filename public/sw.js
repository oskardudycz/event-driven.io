self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.registration.unregister().then(() => self.clients.matchAll()).then(clients => Promise.all(clients.map(client => client.navigate(client.url))))));
