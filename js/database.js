// ============================================================
// TASKFLOW - DATABASE
// IndexedDB local database
// ============================================================

const DB_NAME = "TaskFlowDB";

const DB_VERSION = 5;

const TASK_STORE = "tasks";

const RECURRING_TASK_STORE =
    "recurringTasks";

let db = null;

let dbOpenPromise = null;


// ============================================================
// OPEN DATABASE
// ============================================================

function openDatabase() {

    if (db) {

        return Promise.resolve(
            db
        );

    }


    if (dbOpenPromise) {

        return dbOpenPromise;

    }


    dbOpenPromise =
        new Promise(
            function(resolve, reject) {

                const request =
                    indexedDB.open(
                        DB_NAME,
                        DB_VERSION
                    );


                // ====================================================
                // DATABASE UPGRADE
                // ====================================================

                request.onupgradeneeded =
                    function(event) {

                        const database =
                            event.target.result;


                        // ====================================================
                        // TASK STORE
                        // ====================================================

                        let taskStore;


                        if (
                            !database.objectStoreNames.contains(
                                TASK_STORE
                            )
                        ) {

                            taskStore =
                                database.createObjectStore(
                                    TASK_STORE,
                                    {
                                        keyPath: "id",
                                        autoIncrement: true
                                    }
                                );

                        }

                        else {

                            taskStore =
                                event.target.transaction
                                    .objectStore(
                                        TASK_STORE
                                    );

                        }


                        if (
                            !taskStore.indexNames.contains(
                                "date"
                            )
                        ) {

                            taskStore.createIndex(
                                "date",
                                "date",
                                {
                                    unique: false
                                }
                            );

                        }


                        if (
                            !taskStore.indexNames.contains(
                                "completed"
                            )
                        ) {

                            taskStore.createIndex(
                                "completed",
                                "completed",
                                {
                                    unique: false
                                }
                            );

                        }


                        if (
                            !taskStore.indexNames.contains(
                                "createdAt"
                            )
                        ) {

                            taskStore.createIndex(
                                "createdAt",
                                "createdAt",
                                {
                                    unique: false
                                }
                            );

                        }


                        if (
                            !taskStore.indexNames.contains(
                                "recurringTaskId"
                            )
                        ) {

                            taskStore.createIndex(
                                "recurringTaskId",
                                "recurringTaskId",
                                {
                                    unique: false
                                }
                            );

                        }


                        // ====================================================
                        // RECURRING TASK STORE
                        // ====================================================

                        let recurringStore;


                        if (
                            !database.objectStoreNames.contains(
                                RECURRING_TASK_STORE
                            )
                        ) {

                            recurringStore =
                                database.createObjectStore(
                                    RECURRING_TASK_STORE,
                                    {
                                        keyPath: "id",
                                        autoIncrement: true
                                    }
                                );

                        }

                        else {

                            recurringStore =
                                event.target.transaction
                                    .objectStore(
                                        RECURRING_TASK_STORE
                                    );

                        }


                        if (
                            !recurringStore.indexNames.contains(
                                "frequency"
                            )
                        ) {

                            recurringStore.createIndex(
                                "frequency",
                                "frequency",
                                {
                                    unique: false
                                }
                            );

                        }


                        if (
                            !recurringStore.indexNames.contains(
                                "active"
                            )
                        ) {

                            recurringStore.createIndex(
                                "active",
                                "active",
                                {
                                    unique: false
                                }
                            );

                        }


                        if (
                            !recurringStore.indexNames.contains(
                                "createdAt"
                            )
                        ) {

                            recurringStore.createIndex(
                                "createdAt",
                                "createdAt",
                                {
                                    unique: false
                                }
                            );

                        }


                        if (
                            !recurringStore.indexNames.contains(
                                "startDate"
                            )
                        ) {

                            recurringStore.createIndex(
                                "startDate",
                                "startDate",
                                {
                                    unique: false
                                }
                            );

                        }

                    };


                // ====================================================
                // DATABASE SUCCESS
                // ====================================================

                request.onsuccess =
                    function(event) {

                        db =
                            event.target.result;


                        db.onversionchange =
                            function() {

                                db.close();

                                db = null;

                                dbOpenPromise = null;

                                console.warn(
                                    "TaskFlow database was upgraded in another tab."
                                );

                            };


                        console.log(
                            "TaskFlow database opened successfully."
                        );


                        resolve(
                            db
                        );

                    };


                // ====================================================
                // DATABASE ERROR
                // ====================================================

                request.onerror =
                    function(event) {

                        console.error(
                            "Unable to open TaskFlow database:",
                            event.target.error
                        );


                        dbOpenPromise = null;


                        reject(
                            event.target.error
                        );

                    };


                // ====================================================
                // DATABASE BLOCKED
                // ====================================================

                request.onblocked =
                    function() {

                        console.warn(
                            "TaskFlow database upgrade is blocked. " +
                            "Close other TaskFlow tabs and try again."
                        );

                    };

            }
        );


    return dbOpenPromise;

}


// ============================================================
// TRANSACTION ERROR HANDLING
// ============================================================

function attachTransactionHandlers(
    transaction,
    reject
) {

    transaction.onerror =
        function(event) {

            reject(
                event.target.error ||
                transaction.error ||
                new Error(
                    "IndexedDB transaction failed."
                )
            );

        };


    transaction.onabort =
        function() {

            reject(
                transaction.error ||
                new Error(
                    "IndexedDB transaction was aborted."
                )
            );

        };

}


// ============================================================
// ADD TASK
// ============================================================

async function addTaskToDatabase(task) {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readwrite"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        TASK_STORE
                    )
                    .add(task);


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
// CREATE RECURRING TASK + FIRST TASK ATOMICALLY
// ============================================================

async function addRecurringTaskWithFirstOccurrence(
    recurringTask,
    firstTask
) {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            let recurringId =
                null;

            let taskId =
                null;

            let settled =
                false;


            const transaction =
                database.transaction(
                    [
                        TASK_STORE,
                        RECURRING_TASK_STORE
                    ],
                    "readwrite"
                );


            transaction.oncomplete =
                function() {

                    if (settled) {
                        return;
                    }


                    settled =
                        true;


                    resolve(
                        {
                            recurringTaskId:
                                recurringId,

                            taskId:
                                taskId
                        }
                    );

                };


            transaction.onerror =
                function(event) {

                    if (settled) {
                        return;
                    }


                    settled =
                        true;


                    reject(
                        event.target.error ||
                        transaction.error ||
                        new Error(
                            "Unable to create recurring task."
                        )
                    );

                };


            transaction.onabort =
                function() {

                    if (settled) {
                        return;
                    }


                    settled =
                        true;


                    reject(
                        transaction.error ||
                        new Error(
                            "Unable to create recurring task."
                        )
                    );

                };


            const recurringStore =
                transaction.objectStore(
                    RECURRING_TASK_STORE
                );


            const taskStore =
                transaction.objectStore(
                    TASK_STORE
                );


            const recurringRequest =
                recurringStore.add(
                    recurringTask
                );


            recurringRequest.onsuccess =
                function(event) {

                    recurringId =
                        event.target.result;


                    firstTask.recurringTaskId =
                        recurringId;


                    const taskRequest =
                        taskStore.add(
                            firstTask
                        );


                    taskRequest.onsuccess =
                        function(event) {

                            taskId =
                                event.target.result;

                        };

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
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readonly"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        TASK_STORE
                    )
                    .get(id);


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
// GET TASKS BY DATE
// ============================================================

async function getTasksByDate(date) {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readonly"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        TASK_STORE
                    )
                    .index(
                        "date"
                    )
                    .getAll(
                        date
                    );


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result || []
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
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readonly"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        TASK_STORE
                    )
                    .getAll();


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result || []
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
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readwrite"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        TASK_STORE
                    )
                    .put(
                        task
                    );


            request.onsuccess =
                function() {

                    resolve(
                        true
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
// DELETE TASK
// ============================================================

async function deleteTaskFromDatabase(id) {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readwrite"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        TASK_STORE
                    )
                    .delete(
                        id
                    );


            request.onsuccess =
                function() {

                    resolve(
                        true
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
// DELETE ALL TASKS
// ============================================================

async function deleteAllTasksFromDatabase() {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    TASK_STORE,
                    "readwrite"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        TASK_STORE
                    )
                    .clear();


            request.onsuccess =
                function() {

                    resolve(
                        true
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
// ADD RECURRING TASK
// ============================================================

async function addRecurringTaskToDatabase(task) {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    RECURRING_TASK_STORE,
                    "readwrite"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        RECURRING_TASK_STORE
                    )
                    .add(
                        task
                    );


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
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    RECURRING_TASK_STORE,
                    "readonly"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        RECURRING_TASK_STORE
                    )
                    .getAll();


            request.onsuccess =
                function(event) {

                    resolve(
                        event.target.result || []
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
// UPDATE RECURRING TASK
// ============================================================

async function updateRecurringTaskInDatabase(
    task
) {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    RECURRING_TASK_STORE,
                    "readwrite"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        RECURRING_TASK_STORE
                    )
                    .put(
                        task
                    );


            request.onsuccess =
                function() {

                    resolve(
                        true
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

async function deleteRecurringTaskFromDatabase(
    id
) {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    RECURRING_TASK_STORE,
                    "readwrite"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const request =
                transaction
                    .objectStore(
                        RECURRING_TASK_STORE
                    )
                    .delete(
                        id
                    );


            request.onsuccess =
                function() {

                    resolve(
                        true
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
// DEACTIVATE RECURRING TASK
// ============================================================

async function deactivateRecurringTaskInDatabase(
    id
) {

    const database =
        await openDatabase();


    return new Promise(
        function(resolve, reject) {

            const transaction =
                database.transaction(
                    RECURRING_TASK_STORE,
                    "readwrite"
                );


            attachTransactionHandlers(
                transaction,
                reject
            );


            const store =
                transaction.objectStore(
                    RECURRING_TASK_STORE
                );


            const getRequest =
                store.get(
                    id
                );


            getRequest.onsuccess =
                function(event) {

                    const recurringTask =
                        event.target.result;


                    if (!recurringTask) {

                        reject(
                            new Error(
                                "Recurring task not found."
                            )
                        );

                        return;

                    }


                    recurringTask.active =
                        false;


                    const putRequest =
                        store.put(
                            recurringTask
                        );


                    putRequest.onsuccess =
                        function() {

                            resolve(
                                true
                            );

                        };


                    putRequest.onerror =
                        function(errorEvent) {

                            reject(
                                errorEvent.target.error
                            );

                        };

                };


            getRequest.onerror =
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
