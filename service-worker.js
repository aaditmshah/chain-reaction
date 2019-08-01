importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.routing.registerRoute(/\.js$/, new workbox.strategies.StaleWhileRevalidate({
    cacheName: "js-cache"
}));

workbox.routing.registerRoute(/\.css$/, new workbox.strategies.StaleWhileRevalidate({
    cacheName: "css-cache"
}));

workbox.routing.registerRoute(/\.(?:png|svg|ico)$/, new workbox.strategies.CacheFirst({
    cacheName: "image-cache",
    plugins: [
        new workbox.expiration.Plugin({
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60
        })
    ]
}));

workbox.routing.registerRoute(/\.ogg$/, new workbox.strategies.CacheFirst({
    cacheName: "audio-cache",
    plugins: [
        new workbox.expiration.Plugin({
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60
        })
    ]
}));

workbox.precaching.precacheAndRoute([]);
