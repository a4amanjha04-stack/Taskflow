// ============================================================
// TASKFLOW SERVICE WORKER
// ============================================================

const CACHE_NAME =
    "taskflow-v5";


const CHART_JS_URL =
    "https://cdn.jsdelivr.net/npm/chart.js";


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

            caches
                .open(
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

            caches
                .keys()
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
                .then(
                    function() {

                        return self.clients.claim();

                    }
                )

        );

    }
);


// ============================================================
// FETCH
// ============================================================

self.addEventListener(
    "fetch",
    function(event) {

        const request =
            event.request;


        if (
            request.method !==
            "GET"
        ) {

            return;

        }


        event.respondWith(

            fetch(
                request
            )
            .then(
                function(networkResponse) {

                    /*
                        Do not cache HTTP errors.
                    */

                    if (
                        !networkResponse ||
                        !networkResponse.ok
                    ) {

                        throw new Error(
                            "Network response was not successful."
                        );

                    }


                    const responseToCache =
                        networkResponse.clone();


                    /*
                        Cache local app files and Chart.js.
                    */

                    if (
                        request.url.startsWith(
                            self.location.origin
                        ) ||
                        request.url ===
                            CHART_JS_URL
                    ) {

                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                function(cache) {

                                    cache.put(
                                        request,
                                        responseToCache
                                    );

                                }
                            )
                            .catch(
                                function(error) {

                                    console.warn(
                                        "TaskFlow cache update failed:",
                                        error
                                    );

                                }
                            );

                    }


                    return networkResponse;

                }
            )
            .catch(
                function() {

                    return caches
                        .match(
                            request
                        )
                        .then(
                            function(cachedResponse) {

                                if (
                                    cachedResponse
                                ) {

                                    return cachedResponse;

                                }


                                if (
                                    request.mode ===
                                    "navigate"
                                ) {

                                    return caches.match(
                                        "./index.html"
                                    );

                                }


                                return Response.error();

                            }
                        );

                }
            )

        );

    }
);
