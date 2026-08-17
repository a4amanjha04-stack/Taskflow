// ============================================================
// TASKFLOW - MAIN APPLICATION
// ============================================================


// ============================================================
// DOM
// ============================================================

const addTaskButton = document.getElementById("addTaskButton");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const cancelTask = document.getElementById("cancelTask");
const saveTask = document.getElementById("saveTask");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const customTaskDate = document.getElementById("customTaskDate");
const repeatSelect = document.getElementById("repeatSelect");
const taskList = document.getElementById("taskList");
const progressPercentage = document.getElementById("progressPercentage");
const progressCircleText = document.getElementById("progressCircleText");
const progressFill = document.getElementById("progressFill");
const completedSummary = document.getElementById("completedSummary");
const pendingSummary = document.getElementById("pendingSummary");
const taskCount = document.getElementById("taskCount");
const currentDate = document.getElementById("currentDate");
const greeting = document.getElementById("greeting");
const themeButton = document.getElementById("themeButton");
const settingsThemeButton = document.getElementById("settingsThemeButton");
const characterCount = document.getElementById("characterCount");
const modalTitle = document.getElementById("modalTitle");
const deleteModal = document.getElementById("deleteModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");


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
// DATE HELPERS
// ============================================================

function formatTaskDate(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function getTodayDateValue() {

    return formatTaskDate(new Date());

}


function getTomorrowDateValue() {

    const tomorrow = new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    return formatTaskDate(tomorrow);

}


function getTodayString() {

    return new Date().toLocaleDateString(
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

    if (currentDate) {

        currentDate.textContent =
            getTodayString();

    }

}


function updateGreeting() {

    if (!greeting) {
        return;
    }

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
// TASK DATE SELECTION
// ============================================================

function getTaskDateValue() {

    if (
        !taskDate ||
        taskDate.value === "today"
    ) {

        return getTodayDateValue();

    }


    if (
        taskDate.value === "tomorrow"
    ) {

        return getTomorrowDateValue();

    }


    if (
        taskDate.value === "custom"
    ) {

        if (
            !customTaskDate ||
            !customTaskDate.value
        ) {

            throw new Error(
                "Please choose a date."
            );

        }

        return customTaskDate.value;

    }


    return getTodayDateValue();

}


// ============================================================
// CUSTOM DATE INPUT
// ============================================================

function configureCustomDateInput(
    minDate,
    value = ""
) {

    if (!customTaskDate) {
        return;
    }

    customTaskDate.min =
        minDate || "";

    customTaskDate.value =
        value || "";

    customTaskDate.classList.remove(
        "hidden"
    );

}


function hideCustomDateInput() {

    if (!customTaskDate) {
        return;
    }

    customTaskDate.classList.add(
        "hidden"
    );

    customTaskDate.value = "";

    customTaskDate.removeAttribute(
        "min"
    );

}


if (taskDate) {

    taskDate.addEventListener(
        "change",
        function() {

            if (
                taskDate.value === "custom"
            ) {

                configureCustomDateInput(
                    getTomorrowDateValue(),
                    customTaskDate &&
                    customTaskDate.value
                        ? customTaskDate.value
                        : getTomorrowDateValue()
                );

            }

            else {

                hideCustomDateInput();

            }

        }
    );

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

    const dark =
        theme === "dark";


    document.body.classList.toggle(
        "dark",
        dark
    );


    if (themeButton) {

        themeButton.textContent =
            dark
                ? "☀️"
                : "🌙";

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


    applyTheme(
        newTheme
    );

}


if (themeButton) {

    themeButton.addEventListener(
        "click",
        toggleTheme
    );

}


if (settingsThemeButton) {

    settingsThemeButton.addEventListener(
        "click",
        toggleTheme
    );

}


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
// MODAL DATE STATE
// ============================================================

function resetTaskDateFields() {

    if (taskDate) {

        taskDate.value =
            "today";

    }


    hideCustomDateInput();

}


function openAddTaskModal() {

    editingTaskId = null;

    modalTitle.textContent =
        "Add Task";

    saveTask.textContent =
        "Add Task";

    taskInput.value = "";

    resetTaskDateFields();

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


    const today =
        getTodayDateValue();

    const tomorrow =
        getTomorrowDateValue();


    if (
        taskDate &&
        task.date === today
    ) {

        taskDate.value =
            "today";

        hideCustomDateInput();

    }

    else if (
        taskDate &&
        task.date === tomorrow
    ) {

        taskDate.value =
            "tomorrow";

        hideCustomDateInput();

    }

    else if (taskDate) {

        taskDate.value =
            "custom";


        configureCustomDateInput(
            task.date < today
                ? task.date
                : today,
            task.date
        );

    }


    /*
        Editing an occurrence does not
        silently modify the entire recurring series.
    */

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

    resetTaskDateFields();

    repeatSelect.value =
        "none";

    editingTaskId = null;

}


if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        openAddTaskModal
    );

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeTaskModal
    );

}


if (cancelTask) {

    cancelTask.addEventListener(
        "click",
        closeTaskModal
    );

}


if (taskModal) {

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

}


// ============================================================
// CHARACTER COUNTER
// ============================================================

function updateCharacterCount() {

    if (
        characterCount &&
        taskInput
    ) {

        characterCount.textContent =
            taskInput.value.length;

    }

}


if (taskInput) {

    taskInput.addEventListener(
        "input",
        updateCharacterCount
    );

}


// ============================================================
// SAVE TASK
// ============================================================

let saveInProgress = false;


async function saveTaskHandler() {

    if (saveInProgress) {
        return;
    }


    const title =
        taskInput.value.trim();


    if (!title) {

        taskInput.focus();

        return;

    }


    try {

        saveInProgress = true;

        saveTask.disabled =
            true;


        const selectedDate =
            getTaskDateValue();


        // ====================================================
        // EDIT
        // ====================================================

        if (
            editingTaskId !== null
        ) {

            await editTask(
                editingTaskId,
                title,
                selectedDate
            );

        }


        // ====================================================
        // CREATE
        // ====================================================

        else {

            const frequency =
                repeatSelect.value;


            if (
                frequency === "none"
            ) {

                await createTask(
                    title,
                    selectedDate
                );

            }

            else {

                /*
                    The recurring template and
                    first occurrence are created
                    in one IndexedDB transaction.
                */

                await createRecurringTask(
                    title,
                    frequency,
                    selectedDate
                );

            }

        }


        closeTaskModal();

        await refreshTasks();

        await updateStreak();

    }

    catch (error) {

        console.error(
            "Unable to save task:",
            error
        );


        alert(
            error.message ||
            "Something went wrong. Please try again."
        );

    }

    finally {

        saveInProgress = false;

        saveTask.disabled =
            false;

    }

}


if (saveTask) {

    saveTask.addEventListener(
        "click",
        saveTaskHandler
    );

}


if (taskInput) {

    taskInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                saveTaskHandler();

            }


            if (
                event.key === "Escape"
            ) {

                event.preventDefault();

                closeTaskModal();

            }

        }
    );

}


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

                    const recurring =
                        task.recurringTaskId !== null &&
                        task.recurringTaskId !== undefined;


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
                                    type="button"
                                >
                                    ✏️
                                </button>


                                ${
                                    recurring
                                        ? `
                                            <button
                                                class="task-action"
                                                data-stop-repeat-id="${task.recurringTaskId}"
                                                title="Stop repeating this task"
                                                type="button"
                                            >
                                                ⏹️
                                            </button>
                                          `
                                        : ""
                                }


                                <button
                                    class="task-action delete"
                                    data-delete-id="${task.id}"
                                    title="Delete task"
                                    type="button"
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


    document
        .querySelectorAll(
            "[data-stop-repeat-id]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    handleStopRepeat
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

        await updateStreak();

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
// STOP REPEAT
// ============================================================

async function handleStopRepeat(event) {

    const recurringTaskId =
        Number(
            event.currentTarget.dataset.stopRepeatId
        );


    if (
        !Number.isFinite(
            recurringTaskId
        )
    ) {

        return;

    }


    const confirmed =
        window.confirm(
            "Stop this recurring task? Existing task history will remain, " +
            "but no new occurrences will be created."
        );


    if (!confirmed) {
        return;
    }


    try {

        await stopRecurringTask(
            recurringTaskId
        );


        await refreshTasks();

    }

    catch (error) {

        console.error(error);


        alert(
            error.message ||
            "Unable to stop the recurring task."
        );

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


if (cancelDelete) {

    cancelDelete.addEventListener(
        "click",
        closeDeleteModal
    );

}


if (deleteModal) {

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

}


if (confirmDelete) {

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

                await updateStreak();

            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    error.message ||
                    "Unable to delete the task."
                );

            }

        }
    );

}


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

        const streak =
            await calculateCurrentStreak();


        const element =
            document.getElementById(
                "streakCount"
            );


        if (element) {

            element.textContent =
                streak;

        }

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
        String(
            text ?? ""
        );


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

        await openDatabase();

        /*
            Repair old recurring data before generating
            new occurrences.
        */

        await generateRecurringTasksForToday();

        await refreshTasks();

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

        showDatabaseError();

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


        const today =
            await getDailyStatistics(
                getDateString(
                    new Date()
                )
            );


        const todayPercentage =
            document.getElementById(
                "statsTodayPercentage"
            );


        const todayText =
            document.getElementById(
                "statsTodayText"
            );


        const statsCompleted =
            document.getElementById(
                "statsCompleted"
            );


        const statsTotal =
            document.getElementById(
                "statsTotal"
            );


        const currentStreak =
            document.getElementById(
                "statsCurrentStreak"
            );


        const longestStreak =
            document.getElementById(
                "statsLongestStreak"
            );


        const weeklyPercentage =
            document.getElementById(
                "weeklyPercentage"
            );


        const monthlyPercentage =
            document.getElementById(
                "monthlyPercentage"
            );


        const productivityScore =
            document.getElementById(
                "productivityScore"
            );


        const scoreCircle =
            document.getElementById(
                "scoreCircle"
            );


        const message =
            document.getElementById(
                "productivityMessage"
            );


        if (todayPercentage) {

            todayPercentage.textContent =
                `${today.percentage}%`;

        }


        if (todayText) {

            todayText.textContent =
                `${today.completed} completed · ${today.pending} pending`;

        }


        if (statsCompleted) {

            statsCompleted.textContent =
                today.completed;

        }


        if (statsTotal) {

            statsTotal.textContent =
                today.total;

        }


        if (currentStreak) {

            currentStreak.textContent =
                data.currentStreak;

        }


        if (longestStreak) {

            longestStreak.textContent =
                data.longestStreak;

        }


        if (weeklyPercentage) {

            weeklyPercentage.textContent =
                `${data.weekly.percentage}%`;

        }


        if (monthlyPercentage) {

            monthlyPercentage.textContent =
                `${data.monthly.percentage}%`;

        }


        const score =
            data.productivityScore;


        if (productivityScore) {

            productivityScore.textContent =
                score;

        }


        if (scoreCircle) {

            scoreCircle.textContent =
                score;

        }


        if (message) {

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

        }


        createTodayChart(
            today
        );


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


const statsNavItem =
    document.querySelector(
        '[data-page="statsPage"]'
    );


if (statsNavItem) {

    statsNavItem.addEventListener(
        "click",
        function() {

            setTimeout(
                loadStatisticsDashboard,
                50
            );

        }
    );

}


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
