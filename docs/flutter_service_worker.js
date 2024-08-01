'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "04c6c58ece2d0d80ad6d82da0c3b35fa",
"assets/AssetManifest.json": "8e2d379b7fe98466cd329247edbbf37b",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "5401573d8cf40be88b05aec8ebca0c00",
"assets/images/analytics-outline.svg": "b657b5cba5d01c3ffee24814c3c2c3cf",
"assets/images/candle.svg": "f7e9e3d81421df087c9a9b40fdddcd21",
"assets/images/D1.svg": "67f0bfd5df57d2e24f777f3936cec715",
"assets/images/f_aud.png": "1dcee8db524f4fb8fec99e32448daba6",
"assets/images/f_cad.png": "8db32d6fb41b3bbbafcce11943db931d",
"assets/images/f_chf.png": "aad617697d21a5d719f76321399010eb",
"assets/images/f_eur.png": "d2efd71f70754243a047f296f5be4774",
"assets/images/f_gbp.png": "62068a692e7f3f89131506f2944f64bb",
"assets/images/f_jpy.png": "2f08135935a92cbe3262cd3367a6f159",
"assets/images/f_nzd.png": "f15c38de54839afdc07c43c536474bda",
"assets/images/f_usd.png": "bddcf7f764e2ab5fa25038b7c4819ac1",
"assets/images/H1.svg": "7d008bbe8919e9e1469a392a995a8be8",
"assets/images/H4.svg": "e5086f382aa3f18dc9fd86e57adc2eea",
"assets/images/icon.png": "8e4054c61ec3746469bd7170c5911829",
"assets/images/MN.svg": "ea8be416df0a0a378df1334091a80d28",
"assets/images/ohlc.svg": "1d2bebc5ef99300f35ca96946204dffb",
"assets/images/pulse-outline.svg": "e6ab9f69b4330d3634ca8f56fe3a0543",
"assets/images/RSI.svg": "2467a6a0b79b391388687cde60cb9c9e",
"assets/images/stats-chart-outline.svg": "1d9eaa9d0c202f6637dc0d5f19bd9d16",
"assets/images/time-outline.svg": "fbfd609c7f8b260df0db61774eb2de07",
"assets/images/W1.svg": "e6e0bda21fab6fb8521aa480e350da8d",
"assets/NOTICES": "6a74e8694be44307574b60c1fdc411fe",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "73d36c5bba0ee869eedb3b59a4d28608",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"canvaskit/canvaskit.js": "76f7d822f42397160c5dfc69cbc9b2de",
"canvaskit/canvaskit.wasm": "f48eaf57cada79163ec6dec7929486ea",
"canvaskit/chromium/canvaskit.js": "8c8392ce4a4364cbb240aa09b5652e05",
"canvaskit/chromium/canvaskit.wasm": "fc18c3010856029414b70cae1afc5cd9",
"canvaskit/skwasm.js": "1df4d741f441fa1a4d10530ced463ef8",
"canvaskit/skwasm.wasm": "6711032e17bf49924b2b001cef0d3ea3",
"canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a",
"favicon.png": "e66f3c7818644a01ad85a6acc42da91c",
"flutter.js": "6b515e434cea20006b3ef1726d2c8894",
"icons/Icon-192.png": "68b56f83742eee6850075610e090015b",
"icons/Icon-512.png": "0a9a2b5a006bc4f2d555a878d6136376",
"icons/Icon-maskable-192.png": "68b56f83742eee6850075610e090015b",
"icons/Icon-maskable-512.png": "0a9a2b5a006bc4f2d555a878d6136376",
"index.html": "6ee5a9b903543875a260cfa1af5b5315",
"/": "6ee5a9b903543875a260cfa1af5b5315",
"main.dart.js": "fc20834dec06bbbb496981e6e82c08be",
"manifest.json": "d82f7475a005c29174743f68ae39c8ce",
"version.json": "2592c248eed902b586a991f00bd03f37"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
