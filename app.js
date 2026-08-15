// ============================================================
// TASKFLOW - MAIN APPLICATION
// ============================================================


// ============================================================
// DOM
// ============================================================

const addTaskButton =
    document.getElementById("addTaskButton");

const taskModal =
    document.getElementById("taskModal");

const closeModal =
    document.getElementById("closeModal");

const cancelTask =
    document.getElementById("cancelTask");

const saveTask =
    document.getElementById("saveTask");

const taskInput =
    document.getElementById("taskInput");

const repeatSelect =
    document.getElementById(
        "repeatSelect"
    );

const taskList =
    document.getElementById("taskList");

const progressPercentage =
    document.getElementById(
        "progressPercentage"
    );

const progressCircleText =
    document.getElementById(
        "progressCircleText"
    );

const progressFill =
    document.getElementById(
        "progressFill"
    );

const completedSummary =
    document.getElementById(
        "completedSummary"
    );

const pendingSummary =
    document.getElementById(
        "pendingSummary"
    );

const taskCount =
    document.getElementById(
        "taskCount"
    );

const currentDate =
    document.getElementById(
        "currentDate"
    );

const greeting =
    document.getElementById(
        "greeting"
    );

const themeButton =
    document.getElementById(
        "themeButton"
    );

const settingsThemeButton =
    document.getElementById(
        "settingsThemeButton"
    );

const characterCount =
    document.getElementById(
        "characterCount"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const deleteModal =
    document.getElementById(
        "deleteModal"
    );

const cancelDelete =
    document.getElementById(
        "cancelDelete"
    );

const confirmDelete =
    document.getElementById(
        "confirmDelete"
    );


// ============================================================
// STATE
// ============================================================

let currentTasks = [];

let editingTaskId = null;

let deletingTaskId = null;


// ============================================================
// HISTORY INITIALIZATION
// ============================================================

initializeHistory();


// ============================================================
// DATE
// ============================================================

function getTodayString() {

    const date =
        new Date();

    return date.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


function updateDate() {

    currentDate.textContent =
        getTodayString();

}


function updateGreeting() {

    const hour =
        new Date().getHours();


    if (hour < 12) {

        greeting.textContent =
            "Good morning ☀️";

    }

    else if (hour < 18) {

        greeting.textContent =
            "Good afternoon 👋";

    }

    else {

        greeting.textContent =
            "Good evening 🌙";

    }

}


// ============================================================
// NAVIGATION
// ============================================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


const pages =
    document.querySelectorAll(
        ".page"
    );


navItems.forEach(
    function(navItem) {

        navItem.addEventListener(
            "click",
            function() {

                const pageId =
                    navItem.dataset.page;


                pages.forEach(
                    function(page) {

                        page.classList.remove(
                            "active-page"
                        );

                    }
                );


                const targetPage =
                    document.getElementById(
                        pageId
                    );


                if (targetPage) {

                    targetPage.classList.add(
                        "active-page"
                    );

                }


                navItems.forEach(
                    function(item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                navItem.classList.add(
                    "active"
                );


                // ============================
                // LOAD HISTORY
                // ============================

                if (
                    pageId === "historyPage"
                ) {

                    setTimeout(
                        function() {

                            renderHistoryCalendar();

                        },
                        50
                    );

                }

            }
        );

    }
);


// ============================================================
// THEME
// ============================================================

function applyTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        themeButton.textContent =
            "☀️";

    }

    else {

        document.body.classList.remove(
            "dark"
        );

        themeButton.textContent =
            "🌙";

    }

}


function toggleTheme() {

    const isDark =
        document.body.classList.contains(
            "dark"
        );


    const newTheme =
        isDark
            ? "light"
            : "dark";


    localStorage.setItem(
        "taskflow_theme",
        newTheme
    );


    applyTheme(newTheme);

}


themeButton.addEventListener(
    "click",
    toggleTheme
);


settingsThemeButton.addEventListener(
    "click",
    toggleTheme
);


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "taskflow_theme"
        );


    applyTheme(
        savedTheme || "light"
    );

}


// ============================================================
// MODAL
// ============================================================

function openAddTaskModal() {

    editingTaskId = null;

    modalTitle.textContent =
        "Add Task";

    saveTask.textContent =
        "Add Task";

    taskInput.value = "";

    repeatSelect.value =
        "none";

    updateCharacterCount();

    taskModal.classList.remove(
        "hidden"
    );


    setTimeout(
        function() {

            taskInput.focus();

        },
        100
    );

}


function openEditTaskModal(task) {

    editingTaskId =
        task.id;

    modalTitle.textContent =
        "Edit Task";

    saveTask.textContent =
        "Save Changes";

    taskInput.value =
        task.title;

    repeatSelect.value =
    "none";

    updateCharacterCount();

    taskModal.classList.remove(
        "hidden"
    );


    setTimeout(
        function() {

            taskInput.focus();

            taskInput.select();

        },
        100
    );

}


function closeTaskModal() {

    taskModal.classList.add(
        "hidden"
    );

    taskInput.value = "";

    repeatSelect.value =
        "none";

    editingTaskId = null;

}


addTaskButton.addEventListener(
    "click",
    openAddTaskModal
);


closeModal.addEventListener(
    "click",
    closeTaskModal
);


cancelTask.addEventListener(
    "click",
    closeTaskModal
);


taskModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === taskModal
        ) {

            closeTaskModal();

        }

    }
);


// ============================================================
// CHARACTER COUNTER
// ============================================================

function updateCharacterCount() {

    characterCount.textContent =
        taskInput.value.length;

}


taskInput.addEventListener(
    "input",
    updateCharacterCount
);


// ============================================================
// SAVE TASK
// ============================================================

async function saveTaskHandler() {

    const title =
        taskInput.value.trim();


    if (!title) {

        taskInput.focus();

        return;

    }


    try {

        saveTask.disabled =
            true;


        if (editingTaskId !== null) {

    await editTask(
        editingTaskId,
        title
    );

}

else {

    const frequency =
        repeatSelect.value;


    if (
        frequency === "none"
    ) {

        await createTask(
            title
        );

    }

    else {

        // Create today's normal task

        await createTask(
            title
        );


        // Create recurring template

        await createRecurringTask(
            title,
            frequency
        );

    }

}


        closeTaskModal();

        await refreshTasks();

    }

    catch (error) {

        console.error(
            "Unable to save task:",
            error
        );

        alert(
            "Something went wrong. Please try again."
        );

    }

    finally {

        saveTask.disabled =
            false;

    }

}


saveTask.addEventListener(
    "click",
    saveTaskHandler
);


taskInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            saveTaskHandler();

        }


        if (
            event.key === "Escape"
        ) {

            closeTaskModal();

        }

    }
);


// ============================================================
// LOAD TASKS
// ============================================================

async function refreshTasks() {

    try {

        currentTasks =
            await loadTodayTasks();


        renderTasks();

        updateProgress();

    }

    catch (error) {

        console.error(
            "Unable to load tasks:",
            error
        );

        showDatabaseError();

    }

}


// ============================================================
// RENDER TASKS
// ============================================================

function renderTasks() {

    if (
        currentTasks.length === 0
    ) {

        taskList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    No tasks yet
                </h3>

                <p>
                    Start your day by adding
                    your first task.
                </p>

            </div>

        `;

        return;

    }


    taskList.innerHTML =
        currentTasks
            .map(
                function(task) {

                    return `

                        <div
                            class="task ${
                                task.completed
                                    ? "completed"
                                    : ""
                            }"
                        >

                            <input
                                type="checkbox"
                                class="task-checkbox"
                                ${
                                    task.completed
                                        ? "checked"
                                        : ""
                                }
                                data-task-id="${task.id}"
                            >


                            <span
                                class="task-name"
                            >
                                ${escapeHTML(
                                    task.title
                                )}
                            </span>


                            <div
                                class="task-actions"
                            >

                                <button
                                    class="task-action"
                                    data-edit-id="${task.id}"
                                    title="Edit task"
                                >
                                    ✏️
                                </button>


                                <button
                                    class="task-action delete"
                                    data-delete-id="${task.id}"
                                    title="Delete task"
                                >
                                    🗑️
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    attachTaskListeners();

}


// ============================================================
// TASK LISTENERS
// ============================================================

function attachTaskListeners() {

    document
        .querySelectorAll(
            ".task-checkbox"
        )
        .forEach(
            function(checkbox) {

                checkbox.addEventListener(
                    "change",
                    handleTaskToggle
                );

            }
        );


    document
        .querySelectorAll(
            "[data-edit-id]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    handleTaskEdit
                );

            }
        );


    document
        .querySelectorAll(
            "[data-delete-id]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    handleTaskDelete
                );

            }
        );

}


// ============================================================
// TOGGLE
// ============================================================

async function handleTaskToggle(event) {

    const id =
        Number(
            event.target.dataset.taskId
        );


    try {

        await toggleTaskCompletion(
            id
        );

        await refreshTasks();

    }

    catch (error) {

        console.error(error);

    }

}


// ============================================================
// EDIT
// ============================================================

function handleTaskEdit(event) {

    const id =
        Number(
            event.currentTarget.dataset.editId
        );


    const task =
        currentTasks.find(
            function(item) {

                return item.id === id;

            }
        );


    if (task) {

        openEditTaskModal(task);

    }

}


// ============================================================
// DELETE MODAL
// ============================================================

function handleTaskDelete(event) {

    deletingTaskId =
        Number(
            event.currentTarget.dataset.deleteId
        );


    deleteModal.classList.remove(
        "hidden"
    );

}


function closeDeleteModal() {

    deleteModal.classList.add(
        "hidden"
    );

    deletingTaskId = null;

}


cancelDelete.addEventListener(
    "click",
    closeDeleteModal
);


deleteModal.addEventListener(
    "click",
    function(event) {

        if (
            event.target === deleteModal
        ) {

            closeDeleteModal();

        }

    }
);


confirmDelete.addEventListener(
    "click",
    async function() {

        if (
            deletingTaskId === null
        ) {

            return;

        }


        try {

            await removeTask(
                deletingTaskId
            );

            closeDeleteModal();

            await refreshTasks();

        }

        catch (error) {

            console.error(
                error
            );

            alert(
                "Unable to delete the task."
            );

        }

    }
);


// ============================================================
// PROGRESS
// ============================================================

function updateProgress() {

    const total =
        currentTasks.length;


    const completed =
        currentTasks.filter(
            function(task) {

                return task.completed;

            }
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


    progressPercentage.textContent =
        `${percentage}%`;


    progressCircleText.textContent =
        `${percentage}%`;


    progressFill.style.width =
        `${percentage}%`;


    completedSummary.textContent =
        `${completed} completed`;


    pendingSummary.textContent =
        `${pending} remaining`;


    taskCount.textContent =
        total === 1
            ? "1 task"
            : `${total} tasks`;

}


// ============================================================
// STREAK
// ============================================================

async function updateStreak() {

    try {

        /*
            Use the new 80% completion rule
            from statistics.js.
        */

        const streak =
            await calculateCurrentStreak();


        document.getElementById(
            "streakCount"
        ).textContent =
            streak;

    }

    catch (error) {

        console.error(
            "Unable to calculate streak:",
            error
        );

    }

}


// ============================================================
// SECURITY
// ============================================================

function escapeHTML(text) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text;


    return element.innerHTML;

}


// ============================================================
// ERROR STATE
// ============================================================

function showDatabaseError() {

    taskList.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                We couldn't load your tasks.
                Please refresh the app.
            </p>

        </div>

    `;

}


// ============================================================
// START APPLICATION
// ============================================================

async function startApplication() {

    updateDate();

    updateGreeting();

    loadTheme();


    try {

        // 1. Open database

        await openDatabase();


        // 2. Generate today's recurring
        //    task copies

        await generateRecurringTasksForToday();


        // 3. Load today's tasks

        await refreshTasks();


        // 4. Calculate current streak

        await updateStreak();


        console.log(
            "TaskFlow is ready."
        );

    }

    catch (error) {

        console.error(
            "TaskFlow startup failed:",
            error
        );

    }

}


startApplication();


// ============================================================
// STATISTICS DASHBOARD
// ============================================================

async function loadStatisticsDashboard() {

    try {

        const data =
            await getStatisticsDashboardData();


        // ----------------------------
        // Today
        // ----------------------------

        const today =
            await getDailyStatistics(
                getDateString(
                    new Date()
                )
            );


        document.getElementById(
            "statsTodayPercentage"
        ).textContent =
            `${today.percentage}%`;


        document.getElementById(
            "statsTodayText"
        ).textContent =
            `${today.completed} completed · ${today.pending} pending`;


        document.getElementById(
            "statsCompleted"
        ).textContent =
            today.completed;


        document.getElementById(
            "statsTotal"
        ).textContent =
            today.total;


        document.getElementById(
            "statsCurrentStreak"
        ).textContent =
            data.currentStreak;


        document.getElementById(
            "statsLongestStreak"
        ).textContent =
            data.longestStreak;


        // ----------------------------
        // Weekly
        // ----------------------------

        document.getElementById(
            "weeklyPercentage"
        ).textContent =
            `${data.weekly.percentage}%`;


        // ----------------------------
        // Monthly
        // ----------------------------

        document.getElementById(
            "monthlyPercentage"
        ).textContent =
            `${data.monthly.percentage}%`;


        // ----------------------------
        // Productivity score
        // ----------------------------

        const score =
            data.productivityScore;


        document.getElementById(
            "productivityScore"
        ).textContent =
            score;


        document.getElementById(
            "scoreCircle"
        ).textContent =
            score;


        const message =
            document.getElementById(
                "productivityMessage"
            );


        if (score >= 90) {

            message.textContent =
                "Outstanding! You're operating at your best. 🚀";

        }

        else if (score >= 75) {

            message.textContent =
                "Excellent work. Keep the momentum going! 🔥";

        }

        else if (score >= 50) {

            message.textContent =
                "You're making progress. Keep pushing! 💪";

        }

        else if (score > 0) {

            message.textContent =
                "Every completed task counts. Keep going! 🌱";

        }

        else {

            message.textContent =
                "Start completing tasks to build your score.";

        }


        // ----------------------------
        // Charts
        // ----------------------------

        createTodayChart(today);

        createWeeklyChart(
            data.weekly.days
        );

        createMonthlyChart(
            data.monthly.days
        );


    }

    catch (error) {

        console.error(
            "Statistics failed:",
            error
        );

    }

}


// ============================================================
// LOAD STATS WHEN NAVIGATION OPENS
// ============================================================

document
    .querySelector(
        '[data-page="statsPage"]'
    )
    .addEventListener(
        "click",
        function() {

            setTimeout(
                loadStatisticsDashboard,
                50
            );

        }
    );

    // ============================================================
// SERVICE WORKER
// ============================================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register(
                    "./sw.js"
                )
                .then(
                    function(registration) {

                        console.log(
                            "TaskFlow service worker registered:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    function(error) {

                        console.error(
                            "TaskFlow service worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}