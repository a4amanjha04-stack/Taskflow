// ============================================================
// TASKFLOW - TASK MANAGER
// Handles task creation, loading, updating and deletion
// ============================================================


// ============================================================
// CURRENT DATE
// ============================================================

function getTodayDate() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ============================================================
// CREATE TASK OBJECT
// ============================================================

function createTaskObject(title, date = getTodayDate()) {

    return {

        title: title.trim(),

        completed: false,

        date: date,

        createdAt:
            new Date().toISOString(),

        completedAt: null

    };

}


// ============================================================
// CREATE TASK
// ============================================================

async function createTask(title, date = getTodayDate()) {

    const cleanTitle =
        title.trim();


    if (!cleanTitle) {

        throw new Error(
            "Task title cannot be empty."
        );

    }


    if (cleanTitle.length > 100) {

        throw new Error(
            "Task title cannot exceed 100 characters."
        );

    }


    const task =
        createTaskObject(
            cleanTitle,
            date
        );


    try {

        const id =
            await addTaskToDatabase(task);

        console.log(
            "Task created:",
            id
        );

        return await getTaskFromDatabase(id);

    }

    catch (error) {

        console.error(
            "Unable to create task:",
            error
        );

        throw error;

    }

}


// ============================================================
// LOAD TODAY'S TASKS
// ============================================================

async function loadTodayTasks() {

    const today =
        getTodayDate();

    return await loadTasksForDate(today);

}


// ============================================================
// LOAD TASKS FOR DATE
// ============================================================

async function loadTasksForDate(date) {

    try {

        const tasks =
            await getTasksByDate(date);


        // Sort oldest first
        tasks.sort(
            function(a, b) {

                return new Date(a.createdAt)
                    - new Date(b.createdAt);

            }
        );


        return tasks;

    }

    catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );

        throw error;

    }

}


// ============================================================
// COMPLETE / UNCOMPLETE TASK
// ============================================================

async function toggleTaskCompletion(id) {

    try {

        const task =
            await getTaskFromDatabase(id);


        if (!task) {

            throw new Error(
                "Task not found."
            );

        }


        task.completed =
            !task.completed;


        if (task.completed) {

            task.completedAt =
                new Date().toISOString();

        }

        else {

            task.completedAt =
                null;

        }


        await updateTaskInDatabase(task);


        return task;

    }

    catch (error) {

        console.error(
            "Unable to update task:",
            error
        );

        throw error;

    }

}


// ============================================================
// EDIT TASK
// ============================================================

async function editTask(id, newTitle) {

    const cleanTitle =
        newTitle.trim();


    if (!cleanTitle) {

        throw new Error(
            "Task title cannot be empty."
        );

    }


    if (cleanTitle.length > 100) {

        throw new Error(
            "Task title cannot exceed 100 characters."
        );

    }


    try {

        const task =
            await getTaskFromDatabase(id);


        if (!task) {

            throw new Error(
                "Task not found."
            );

        }


        task.title =
            cleanTitle;


        await updateTaskInDatabase(task);


        return task;

    }

    catch (error) {

        console.error(
            "Unable to edit task:",
            error
        );

        throw error;

    }

}


// ============================================================
// DELETE TASK
// ============================================================

async function removeTask(id) {

    try {

        const task =
            await getTaskFromDatabase(id);


        if (!task) {

            throw new Error(
                "Task not found."
            );

        }


        await deleteTaskFromDatabase(id);


        return true;

    }

    catch (error) {

        console.error(
            "Unable to delete task:",
            error
        );

        throw error;

    }

}


// ============================================================
// GET TASK STATISTICS
// ============================================================

async function getTaskStatistics(date = getTodayDate()) {

    const tasks =
        await getTasksByDate(date);


    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        total - completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    return {

        date: date,

        total: total,

        completed: completed,

        pending: pending,

        percentage: percentage

    };

}


// ============================================================
// GET ALL TASKS
// ============================================================

async function getAllTasks() {

    try {

        return await getAllTasksFromDatabase();

    }

    catch (error) {

        console.error(
            "Unable to load all tasks:",
            error
        );

        throw error;

    }

}


// ============================================================
// GET TASKS BETWEEN TWO DATES
// ============================================================

async function getTasksBetweenDates(
    startDate,
    endDate
) {

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

    const statistics =
        await getTaskStatistics(date);


    return statistics.percentage;

}


// ============================================================
// GET WEEK STATISTICS
// ============================================================

async function getWeekStatistics(
    referenceDate = new Date()
) {

    const date =
        new Date(referenceDate);


    // Find Monday
    const day =
        date.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;


    const monday =
        new Date(date);

    monday.setDate(
        date.getDate() + difference
    );


    const statistics = [];


    for (let i = 0; i < 7; i++) {

        const current =
            new Date(monday);


        current.setDate(
            monday.getDate() + i
        );


        const dateString =
            formatDate(current);


        const stats =
            await getTaskStatistics(
                dateString
            );


        statistics.push(stats);

    }


    return statistics;

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

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
// TASK MANAGER READY EVENT
// ============================================================

document.dispatchEvent(
    new CustomEvent(
        "taskflowTasksReady"
    )
);

// ============================================================
// RECURRING TASKS
// ============================================================


// ============================================================
// CREATE RECURRING TASK
// ============================================================

async function createRecurringTask(
    title,
    frequency
) {

    const cleanTitle =
        title.trim();


    if (!cleanTitle) {

        throw new Error(
            "Task title cannot be empty."
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


    const recurringTask = {

        title: cleanTitle,

        frequency: frequency,

        active: true,

        createdAt:
            new Date().toISOString()

    };


    return await addRecurringTaskToDatabase(
        recurringTask
    );

}


// ============================================================
// GET RECURRING TASKS
// ============================================================

async function getRecurringTasks() {

    return await getAllRecurringTasksFromDatabase();

}


// ============================================================
// DELETE RECURRING TASK
// ============================================================

async function removeRecurringTask(id) {

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


        case "weekly":

            const created =
                new Date(
                    recurringTask.createdAt
                );


            return (
                created.getDay() === day
            );


        default:

            return false;

    }

}


// ============================================================
// GENERATE TODAY'S RECURRING TASKS
// ============================================================

async function generateRecurringTasksForToday() {

    const recurringTasks =
        await getRecurringTasks();


    const today =
        new Date();


    const todayString =
        getTodayDate();


    const existingTasks =
        await getTasksByDate(
            todayString
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
                today
            )
        ) {

            continue;

        }


        const alreadyExists =
            existingTasks.some(
                task =>
                    task.recurringTaskId ===
                    recurringTask.id
            );


        if (
            alreadyExists
        ) {

            continue;

        }


        const task = {

            title:
                recurringTask.title,

            completed: false,

            date:
                todayString,

            createdAt:
                new Date().toISOString(),

            completedAt: null,

            recurringTaskId:
                recurringTask.id

        };


        await addTaskToDatabase(
            task
        );

    }

}