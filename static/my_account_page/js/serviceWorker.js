self.addEventListener('notificationclose', function(event) {
    var notification = event.notification;
    var primaryKey = notification.data.primaryKey;
  
    console.log('Closed notification: ' + primaryKey);
});

self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    var primaryKey = notification.data.primaryKey;
    var action = event.action;

    if (action === 'close') {
        notification.close();
    } else {
        clients.openWindow('http://localhost:6969/map_page/map_page.html');
        notification.close();
    }
});

self.addEventListener('push', function(event) {
    console.log('receive push message, event')
    var options = {
        title: 'THIS IS CRIC!!!',
        body: event.data.text(),
        icon: '/res/CRIC LOGO SCRIS-09-iloveimg-cropped.png',
        data: {
            dateOfArrival: Date.now()
        }
    };
    const notificationPromise = self.registration.showNotification(options.title, options);
    event.waitUntil(notificationPromise);
});

let currentCache = "cric-offline-cache";

self.addEventListener('install', event => {
    console.log('caching the offline resources');

    event.waitUntil(
      caches.open(currentCache).then(function(cache) {
        return cache.addAll([
            '/offline.html',
            '/../res/imageedit_1_7587001916.png'
        ]);
      })
    );
  });
  
self.addEventListener('fetch', event => {
if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
        fetch(event.request.url).catch(error => {
            return caches.match('offline.html');
        })
    );
}
else{
    event.respondWith(caches.match(event.request)
                    .then(function (response) {
                    return response || fetch(event.request);
                })
        );
    }
});