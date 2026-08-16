// ============================================================
// TASKFLOW SERVICE WORKER
// ============================================================

const CACHE_NAME = "taskflow-v3";

const APP_FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json",

    "./js/database.js",

    "./js/tasks.js",

    "./js/statistics.js",

    "./js/charts.js",

    "./js/history.js"

];


// ============================================================
// INSTALL
// ============================================================

self.addEventListener(
    "install",
    function(event) {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(
                function(cache) {

                    return cache.addAll(
                        APP_FILES
                    );

                }
            )

        );

        // Activate the new service worker
        // immediately.

        self.skipWaiting();

    }
);


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener(
    "activate",
    function(event) {

        event.waitUntil(

            caches.keys()
                .then(
                    function(cacheNames) {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    function(name) {

                                        return (
                                            name !==
                                            CACHE_NAME
                                        );

                                    }
                                )
                                .map(
                                    function(name) {

                                        return caches.delete(
                                            name
                                        );

                                    }
                                )

                        );

                    }
                )

        );

        // Take control of open pages.

        self.clients.claim();

    }
);


// ============================================================
// FETCH
// ============================================================

self.addEventListener(
    "fetch",
    function(event) {

        // For normal page/app requests,
        // try the network first so updates
        // from GitHub Pages are received.

        event.respondWith(

            fetch(
                event.request
            )
            .then(
                function(networkResponse) {

                    return networkResponse;

                }
            )
            .catch(
                function() {

                    // If there is no internet,
                    // use the cached version.

                    return caches.match(
                        event.request
                    );

                }
            )

        );

    }
);
