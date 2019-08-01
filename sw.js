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

workbox.precaching.precacheAndRoute([
  {
    "url": "audio/add.ogg",
    "revision": "7872acedf9a041e580dbfbac9e7248b9"
  },
  {
    "url": "audio/defeat.ogg",
    "revision": "e8b0edee08f17cb510966ebb2ccaf64a"
  },
  {
    "url": "audio/gameover.ogg",
    "revision": "daff877137a2c8103807f084c5d13c95"
  },
  {
    "url": "audio/split.ogg",
    "revision": "6387a110043aee75bcbba62b1a2e82f2"
  },
  {
    "url": "audio/victory.ogg",
    "revision": "c83340bb628b6e959bc1360e3604a18a"
  },
  {
    "url": "icons/android-chrome-192x192.png",
    "revision": "1393141bdd00a513243d6274aec5e06e"
  },
  {
    "url": "icons/android-chrome-512x512.png",
    "revision": "87413de26ff3f3eee1af2b6f506ea9b2"
  },
  {
    "url": "icons/apple-touch-icon.png",
    "revision": "7cae833097e8d87e8f56cdc616bf08e0"
  },
  {
    "url": "icons/favicon-16x16.png",
    "revision": "becbccbd44a6f8339b8e077ec27cbfd3"
  },
  {
    "url": "icons/favicon-32x32.png",
    "revision": "996ed25d371328c0437064df7e1af8e7"
  },
  {
    "url": "icons/favicon.ico",
    "revision": "ed5c210a58c0f4ad799238bb9e38025a"
  },
  {
    "url": "icons/favicon.svg",
    "revision": "aefd1fc32acb1407cf0be8ad784f20c2"
  },
  {
    "url": "icons/mstile-144x144.png",
    "revision": "8145728761a3450c40fb922d70da01a7"
  },
  {
    "url": "icons/mstile-150x150.png",
    "revision": "b78a9f895bbcc4fd171be465c911c3ab"
  },
  {
    "url": "icons/mstile-310x150.png",
    "revision": "3a7517351850a1756403aeefb9e2f124"
  },
  {
    "url": "icons/mstile-310x310.png",
    "revision": "731dbc0dbffeae8a71b9ae7eb675558e"
  },
  {
    "url": "icons/mstile-70x70.png",
    "revision": "e68c09d2a74f9af4be99c57a37c7f9cb"
  },
  {
    "url": "icons/safari-pinned-tab.svg",
    "revision": "7d500aa5dbe850fad2a5170c91e736cd"
  },
  {
    "url": "scripts/index.js",
    "revision": "fe281dd831090fae909ac49a1509b02a"
  },
  {
    "url": "scripts/monaco.js",
    "revision": "aac8adb3b70b65ae8f0cda434a51e5b5"
  },
  {
    "url": "scripts/worker.js",
    "revision": "8f353e7070d5b96a197d8bae1187ca20"
  },
  {
    "url": "styles/index.css",
    "revision": "1fbbd0770c856dabc0b84f7f29341384"
  },
  {
    "url": "browserconfig.xml",
    "revision": "63e6763d22d2adadb9dde59a4cfe0682"
  },
  {
    "url": "manifest.json",
    "revision": "6e663a989071ef079e54b66590af0474"
  },
  {
    "url": "index.html",
    "revision": "8daa157108f766f9f50e08320821e8a1"
  }
]);
