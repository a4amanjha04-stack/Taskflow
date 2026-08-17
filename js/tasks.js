// ============================================================
// TASKFLOW - TASK MANAGER
// ============================================================


// ============================================================
// DATE HELPERS
// ============================================================

function getTodayDate() {

    return formatDate(
        new Date()
    );

}


function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;

}


function isValidTaskDate(dateString) {

    if (
        typeof dateString !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(
            dateString
        )
    ) {

        return false;

    }


    const parts =
        dateString
            .split("-")
            .map(Number);


    const date =
        new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
        );


    return (
        date.getFullYear() === parts[0] &&
        date.getMonth() === parts[1] - 1 &&
        date.getDate() === parts[2]
    );

}


function validateTaskDate(date) {

    if (
        !isValidTaskDate(date)
    ) {

        throw new Error(
            "Please choose a valid task date."
        );

    }

}


function parseTaskDate(dateString) {

    const parts =
        dateString
            .split("-")
            .map(Number);


    return new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
    );

}


// ============================================================
// CREATE TASK OBJECT
// ============================================================

function createTaskObject(
    title,
    date = getTodayDate(),
    recurringTaskId = null
) {

    validateTaskDate(
        date
    );


    return {

        title:
            title.trim(),

        completed:
            false,

        date:
            date,

        createdAt:
            new Date().toISOString(),

        completedAt:
            null,

        recurringTaskId:
            recurringTaskId

    };

}


// ============================================================
// CREATE TASK
// ============================================================

async function createTask(
    title,
    date = getTodayDate()
) {

    const cleanTitle =
        title.trim();


    if (!cleanTitle) {

        throw new Error(
            "Task title cannot be empty."
        );

    }


    if (
        cleanTitle.length > 100
    ) {

        throw new Error(
            "Task title cannot exceed 100 characters."
        );

    }


    validateTaskDate(
        date
    );


    const task =
        createTaskObject(
            cleanTitle,
            date
        );


    const id =
        await addTaskToDatabase(
            task
        );


    return await getTaskFromDatabase(
        id
    );

}


// ============================================================
// CREATE RECURRING TASK
// ============================================================

async function createRecurringTask(
    title,
    frequency,
    startDate
) {

    const cleanTitle =
        title.trim();


    if (!cleanTitle) {

        throw new Error(
            "Task title cannot be empty."
        );

    }


    if (
        cleanTitle.length > 100
    ) {

        throw new Error(
            "Task title cannot exceed 100 characters."
        );

    }


    const validFrequencies = [
        "daily",
        "weekdays",
        "weekly"
    ];


    if (
        !validFrequencies.includes(
            frequency
        )
    ) {

        throw new Error(
            "Invalid recurring task frequency."
        );

    }


    validateTaskDate(
        startDate
    );


    const recurringTask = {

        title:
            cleanTitle,

        frequency:
            frequency,

        active:
            true,

        startDate:
            startDate,

        endDate:
            null,

        createdAt:
            new Date().toISOString()

    };


    const firstTask =
        createTaskObject(
            cleanTitle,
            startDate
        );


    return await addRecurringTaskWithFirstOccurrence(
        recurringTask,
        firstTask
    );

}


// ============================================================
// LOAD TODAY'S TASKS
// ============================================================

async function loadTodayTasks() {

    return await loadTasksForDate(
        getTodayDate()
    );

}


// ============================================================
// LOAD TASKS FOR DATE
// ============================================================

async function loadTasksForDate(
    date
) {

    validateTaskDate(
        date
    );


    const tasks =
        await getTasksByDate(
            date
        );


    tasks.sort(
        function(a, b) {

            return (
                new Date(a.createdAt) -
                new Date(b.createdAt)
            );

        }
    );


    return tasks;

}


// ============================================================
// COMPLETE / UNCOMPLETE TASK
// ============================================================

async function toggleTaskCompletion(
    id
) {

    const task =
        await getTaskFromDatabase(
            id
        );


    if (!task) {

        throw new Error(
            "Task not found."
        );

    }


    task.completed =
        !task.completed;


    task.completedAt =
        task.completed
            ? new Date().toISOString()
            : null;


    await updateTaskInDatabase(
        task
    );


    return task;

}


// ============================================================
// EDIT TASK
// ============================================================

async function editTask(
    id,
    newTitle,
    newDate
) {

    const cleanTitle =
        newTitle.trim();


    if (!cleanTitle) {

        throw new Error(
            "Task title cannot be empty."
        );

    }


    if (
        cleanTitle.length > 100
    ) {

        throw new Error(
            "Task title cannot exceed 100 characters."
        );

    }


    const task =
        await getTaskFromDatabase(
            id
        );


    if (!task) {

        throw new Error(
            "Task not found."
        );

    }


    const finalDate =
        typeof newDate === "string" &&
        newDate
            ? newDate
            : task.date;


    validateTaskDate(
        finalDate
    );


    task.title =
        cleanTitle;


    task.date =
        finalDate;


    await updateTaskInDatabase(
        task
    );


    return task;

}


// ============================================================
// DELETE TASK
// ============================================================

async function removeTask(
    id
) {

    const task =
        await getTaskFromDatabase(
            id
        );


    if (!task) {

        throw new Error(
            "Task not found."
        );

    }


    await deleteTaskFromDatabase(
        id
    );


    return true;

}


// ============================================================
// GET TASK STATISTICS
// ============================================================

async function getTaskStatistics(
    date = getTodayDate()
) {

    const tasks =
        await getTasksByDate(
            date
        );


    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const pending =
        total - completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    return {

        date,

        total,

        completed,

        pending,

        percentage

    };

}


// ============================================================
// GET ALL TASKS
// ============================================================

async function getAllTasks() {

    return await getAllTasksFromDatabase();

}


// ============================================================
// GET TASKS BETWEEN TWO DATES
// ============================================================

async function getTasksBetweenDates(
    startDate,
    endDate
) {

    validateTaskDate(
        startDate
    );


    validateTaskDate(
        endDate
    );


    const allTasks =
        await getAllTasks();


    return allTasks.filter(
        function(task) {

            return (
                task.date >= startDate &&
                task.date <= endDate
            );

        }
    );

}


// ============================================================
// GET COMPLETION PERCENTAGE
// ============================================================

async function getCompletionPercentage(
    date = getTodayDate()
) {

    return (
        await getTaskStatistics(
            date
        )
    ).percentage;

}


// ============================================================
// GET WEEK STATISTICS
// ============================================================

async function getWeekStatistics(
    referenceDate = new Date()
) {

    const date =
        new Date(
            referenceDate
        );


    const day =
        date.getDay();


    const difference =
        day === 0
            ? -6
            : 1 - day;


    const monday =
        new Date(
            date
        );


    monday.setDate(
        date.getDate() +
        difference
    );


    const statistics = [];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const current =
            new Date(
                monday
            );


        current.setDate(
            monday.getDate() +
            i
        );


        statistics.push(
            await getTaskStatistics(
                formatDate(
                    current
                )
            )
        );

    }


    return statistics;

}


// ============================================================
// GET TODAY'S SUMMARY
// ============================================================

async function getTodaySummary() {

    return await getTaskStatistics(
        getTodayDate()
    );

}


// ============================================================
// GET RECURRING TASKS
// ============================================================

async function getRecurringTasks() {

    return await getAllRecurringTasksFromDatabase();

}


// ============================================================
// STOP RECURRING TASK
// ============================================================

async function stopRecurringTask(
    id
) {

    if (
        id === null ||
        id === undefined
    ) {

        throw new Error(
            "Recurring task not found."
        );

    }


    await deactivateRecurringTaskInDatabase(
        id
    );


    return true;

}


// ============================================================
// DELETE RECURRING TASK SERIES
// ============================================================

async function removeRecurringTask(
    id
) {

    return await deleteRecurringTaskFromDatabase(
        id
    );

}


// ============================================================
// CHECK RECURRING SCHEDULE
// ============================================================

function shouldCreateRecurringTask(
    recurringTask,
    date
) {

    const dateString =
        formatDate(
            date
        );


    const startDate =
        recurringTask.startDate ||
        formatDate(
            new Date(
                recurringTask.createdAt
            )
        );


    if (
        dateString < startDate
    ) {

        return false;

    }


    if (
        recurringTask.endDate &&
        dateString >
            recurringTask.endDate
    ) {

        return false;

    }


    const day =
        date.getDay();


    switch (
        recurringTask.frequency
    ) {

        case "daily":

            return true;


        case "weekdays":

            return (
                day >= 1 &&
                day <= 5
            );


        case "weekly": {

            const start =
                parseTaskDate(
                    startDate
                );


            return (
                start.getDay() ===
                day
            );

        }


        default:

            return false;

    }

}


// ============================================================
// REPAIR OLD RECURRING DATA
// ============================================================

async function repairLegacyRecurringTasks() {

    const recurringTasks =
        await getRecurringTasks();


    const allTasks =
        await getAllTasks();


    for (
        const recurringTask
        of recurringTasks
    ) {

        let changed =
            false;


        if (
            !recurringTask.startDate
        ) {

            const createdDate =
                formatDate(
                    new Date(
                        recurringTask.createdAt
                    )
                );


            const matchingTasks =
                allTasks
                    .filter(
                        function(task) {

                            return (
                                !task.recurringTaskId &&
                                task.title ===
                                    recurringTask.title &&
                                task.date >=
                                    createdDate
                            );

                        }
                    )
                    .sort(
                        function(a, b) {

                            return (
                                a.date.localeCompare(
                                    b.date
                                ) ||
                                (
                                    new Date(
                                        a.createdAt
                                    ) -
                                    new Date(
                                        b.createdAt
                                    )
                                )
                            );

                        }
                    );


            recurringTask.startDate =
                matchingTasks.length > 0
                    ? matchingTasks[0].date
                    : createdDate;


            recurringTask.endDate =
                null;


            changed =
                true;


            /*
                Link the first old occurrence.
            */

            if (
                matchingTasks.length > 0
            ) {

                const firstTask =
                    matchingTasks[0];


                firstTask.recurringTaskId =
                    recurringTask.id;


                await updateTaskInDatabase(
                    firstTask
                );

            }

        }


        if (changed) {

            await updateRecurringTaskInDatabase(
                recurringTask
            );

        }

    }

}


// ============================================================
// GENERATE RECURRING TASKS FOR DATE
// ============================================================

async function generateRecurringTasksForDate(
    targetDate = new Date()
) {

    const recurringTasks =
        await getRecurringTasks();


    const date =
        new Date(
            targetDate
        );


    const dateString =
        formatDate(
            date
        );


    const existingTasks =
        await getTasksByDate(
            dateString
        );


    for (
        const recurringTask
        of recurringTasks
    ) {

        if (
            !recurringTask.active
        ) {

            continue;

        }


        if (
            !shouldCreateRecurringTask(
                recurringTask,
                date
            )
        ) {

            continue;

        }


        const alreadyExists =
            existingTasks.some(
                function(task) {

                    return (
                        Number(
                            task.recurringTaskId
                        ) ===
                        Number(
                            recurringTask.id
                        )
                    );

                }
            );


        if (
            alreadyExists
        ) {

            continue;

        }


        const task =
            createTaskObject(
                recurringTask.title,
                dateString,
                recurringTask.id
            );


        await addTaskToDatabase(
            task
        );


        existingTasks.push(
            task
        );

    }

}


// ============================================================
// GENERATE TODAY'S RECURRING TASKS
// ============================================================

async function generateRecurringTasksForToday() {

    await repairLegacyRecurringTasks();

    await generateRecurringTasksForDate(
        new Date()
    );

}


document.dispatchEvent(
    new CustomEvent(
        "taskflowTasksReady"
    )
);
