// ============================================================
// TASKFLOW SERVICE WORKER
// ============================================================

const CACHE_NAME = "taskflow-v1";


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


        self.clients.claim();

    }
);


// ============================================================
// FETCH
// ============================================================

self.addEventListener(
    "fetch",
    function(event) {

        event.respondWith(

            caches.match(
                event.request
            )
            .then(
                function(cachedResponse) {

                    if (
                        cachedResponse
                    ) {

                        return cachedResponse;

                    }


                    return fetch(
                        event.request
                    )
                    .then(
                        function(response) {

                            return response;

                        }
                    );

                }
            )

        );

    }
);