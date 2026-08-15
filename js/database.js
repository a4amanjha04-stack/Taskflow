// ============================================================
// TASKFLOW - DATABASE
// IndexedDB local database
// ============================================================

const DB_NAME = "TaskFlowDB";
const DB_VERSION = 3;
const TASK_STORE = "tasks";
const RECURRING_TASK_STORE = "recurringTasks";

let db = null;


// ============================================================
// OPEN DATABASE
// ============================================================

function openDatabase() {

    return new Promise((resolve, reject) => {

        // If database is already open, reuse it
        if (db) {

            resolve(db);

            return;

        }


        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );


        // ----------------------------------------------------
        // CREATE / UPGRADE DATABASE STRUCTURE
        // ----------------------------------------------------

        request.onupgradeneeded =
            function(event) {

                const database =
                    event.target.result;


                // ====================================================
                // TASKS STORE
                // ====================================================

                if (
                    !database.objectStoreNames.contains(
                        TASK_STORE
                    )
                ) {

                    const taskStore =
                        database.createObjectStore(
                            TASK_STORE,
                            {
                                keyPath: "id",
                                autoIncrement: true
                            }
                        );


                    taskStore.createIndex(
                        "date",
                        "date",
                        {
                            unique: false
                        }
                    );


                    taskStore.createIndex(
                        "completed",
                        "completed",
                        {
                            unique: false
                        }
                    );


                    taskStore.createIndex(
                        "createdAt",
                        "createdAt",
                        {
                            unique: false
                        }
                    );

                }


                // ====================================================
                // RECURRING TASKS STORE
                // ====================================================

                if (
                    !database.objectStoreNames.contains(
                        RECURRING_TASK_STORE
                    )
                ) {

                    const recurringStore =
                        database.createObjectStore(
                            RECURRING_TASK_STORE,
                            {
                                keyPath: "id",
                                autoIncrement: true
                            }
                        );


                    recurringStore.createIndex(
                        "frequency",
                        "frequency",
                        {
                            unique: false
                        }
                    );


                    recurringStore.createIndex(
                        "active",
                        "active",
                        {
                            unique: false
                        }
                    );


                    recurringStore.createIndex(
                        "createdAt",
                        "createdAt",
                        {
                            unique: false
                        }
                    );

                }

            };


        // ----------------------------------------------------
        // DATABASE SUCCESSFULLY OPENED
        // ----------------------------------------------------

        request.onsuccess =
            function(event) {

                db =
                    event.target.result;


                console.log(
                    "TaskFlow database opened successfully."
                );


                resolve(db);

            };


        // ----------------------------------------------------
        // DATABASE ERROR
        // ----------------------------------------------------

        request.onerror =
            function(event) {

                console.error(
                    "Unable to open TaskFlow database:",
                    event.target.error
                );


                reject(
                    event.target.error
                );

            };


        // ----------------------------------------------------
        // DATABASE BLOCKED
        // ----------------------------------------------------

        request.onblocked =
            function() {

                console.warn(
                    "TaskFlow database is blocked. " +
                    "Please close other TaskFlow tabs."
                );

            };

    });

}


// ============================================================
// ADD TASK
// ============================================================

async function addTaskToDatabase(task) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    TASK_STORE
                );


            const request =
                store.add(task);


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// GET TASK BY ID
// ============================================================

async function getTaskFromDatabase(id) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    TASK_STORE
                );


            const request =
                store.get(id);


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// GET TASKS FOR A SPECIFIC DATE
// ============================================================

async function getTasksByDate(date) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    TASK_STORE
                );


            const index =
                store.index("date");


            const request =
                index.getAll(date);


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// GET ALL TASKS
// ============================================================

async function getAllTasksFromDatabase() {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    TASK_STORE
                );


            const request =
                store.getAll();


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// UPDATE TASK
// ============================================================

async function updateTaskInDatabase(task) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    TASK_STORE
                );


            const request =
                store.put(task);


            request.onsuccess =
                function() {

                    resolve(true);

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// DELETE TASK
// ============================================================

async function deleteTaskFromDatabase(id) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    TASK_STORE
                );


            const request =
                store.delete(id);


            request.onsuccess =
                function() {

                    resolve(true);

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// DELETE ALL TASKS
// ============================================================

async function deleteAllTasksFromDatabase() {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    TASK_STORE
                );


            const request =
                store.clear();


            request.onsuccess =
                function() {

                    resolve(true);

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// ADD RECURRING TASK
// ============================================================

async function addRecurringTaskToDatabase(task) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    RECURRING_TASK_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    RECURRING_TASK_STORE
                );


            const request =
                store.add(task);


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// GET ALL RECURRING TASKS
// ============================================================

async function getAllRecurringTasksFromDatabase() {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    RECURRING_TASK_STORE,
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    RECURRING_TASK_STORE
                );


            const request =
                store.getAll();


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// DELETE RECURRING TASK
// ============================================================

async function deleteRecurringTaskFromDatabase(id) {

    const database =
        await openDatabase();


    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    RECURRING_TASK_STORE,
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    RECURRING_TASK_STORE
                );


            const request =
                store.delete(id);


            request.onsuccess =
                function() {

                    resolve(true);

                };


            request.onerror =
                function(event) {

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


// ============================================================
// DATABASE INITIALIZATION
// ============================================================

openDatabase()
    .catch(
        function(error) {

            console.error(
                "TaskFlow database initialization failed:",
                error
            );

        }
    );