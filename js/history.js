// ============================================================
// TASKFLOW - HISTORY ENGINE
// ============================================================


// ============================================================
// DATE HELPERS
// ============================================================

function historyFormatDate(date) {

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


function historyParseDate(
    dateString
) {

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


function historyMonthStart(
    date
) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
    );

}


// ============================================================
// MONTH NAMES
// ============================================================

const historyMonthNames = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];


// ============================================================
// HISTORY STATE
// ============================================================

let historyCurrentMonth =
    historyMonthStart(
        new Date()
    );


let historySelectedDate =
    historyFormatDate(
        new Date()
    );


// ============================================================
// GET MONTH DAYS
// ============================================================

function getMonthCalendarDays(
    year,
    month
) {

    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );


    const firstWeekday =
        firstDay.getDay();


    const daysInMonth =
        lastDay.getDate();


    const days = [];


    // Previous month

    for (
        let i = firstWeekday;
        i > 0;
        i--
    ) {

        const date =
            new Date(
                year,
                month,
                1 - i
            );


        days.push(
            {
                date,
                currentMonth: false
            }
        );

    }


    // Current month

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        days.push(
            {
                date,
                currentMonth: true
            }
        );

    }


    // Next month

    while (
        days.length % 7 !== 0
    ) {

        const date =
            new Date(
                year,
                month,
                days.length -
                    daysInMonth -
                    firstWeekday +
                    1
            );


        days.push(
            {
                date,
                currentMonth: false
            }
        );

    }


    return days;

}


// ============================================================
// GET MONTH STATISTICS
// ============================================================

async function getHistoryMonthStatistics(
    year,
    month
) {

    const days =
        getMonthCalendarDays(
            year,
            month
        );


    /*
        Load all tasks once instead of
        making a database query for every
        calendar cell.
    */

    const allTasks =
        await getAllTasks();


    return days.map(
        function(day) {

            const dateString =
                historyFormatDate(
                    day.date
                );


            const dayTasks =
                allTasks.filter(
                    function(task) {

                        return (
                            task.date ===
                            dateString
                        );

                    }
                );


            const total =
                dayTasks.length;


            const completed =
                dayTasks.filter(
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

                ...day,

                total,

                completed,

                pending,

                percentage

            };

        }
    );

}


// ============================================================
// KEEP SELECTED DATE IN MONTH
// ============================================================

function ensureHistorySelectedDateIsVisible() {

    const selected =
        historyParseDate(
            historySelectedDate
        );


    if (
        selected.getFullYear() !==
            historyCurrentMonth.getFullYear() ||
        selected.getMonth() !==
            historyCurrentMonth.getMonth()
    ) {

        historySelectedDate =
            historyFormatDate(
                new Date(
                    historyCurrentMonth.getFullYear(),
                    historyCurrentMonth.getMonth(),
                    1
                )
            );

    }

}


// ============================================================
// RENDER CALENDAR
// ============================================================

async function renderHistoryCalendar() {

    const calendar =
        document.getElementById(
            "historyCalendar"
        );


    if (!calendar) {
        return;
    }


    historyCurrentMonth =
        historyMonthStart(
            historyCurrentMonth
        );


    ensureHistorySelectedDateIsVisible();


    const year =
        historyCurrentMonth.getFullYear();


    const month =
        historyCurrentMonth.getMonth();


    const title =
        document.getElementById(
            "historyMonthTitle"
        );


    if (title) {

        title.textContent =
            `${historyMonthNames[month]} ${year}`;

    }


    const days =
        await getHistoryMonthStatistics(
            year,
            month
        );


    calendar.innerHTML = "";


    const today =
        historyFormatDate(
            new Date()
        );


    days.forEach(
        function(day) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "calendar-day";


            if (
                !day.currentMonth
            ) {

                button.classList.add(
                    "outside-month"
                );

            }


            const dateString =
                historyFormatDate(
                    day.date
                );


            if (
                dateString ===
                today
            ) {

                button.classList.add(
                    "today"
                );

            }


            if (
                dateString ===
                historySelectedDate
            ) {

                button.classList.add(
                    "selected"
                );

            }


            if (
                day.total > 0
            ) {

                button.classList.add(
                    "has-tasks"
                );


                if (
                    day.percentage === 100
                ) {

                    button.classList.add(
                        "productivity-100"
                    );

                }

                else if (
                    day.percentage >= 75
                ) {

                    button.classList.add(
                        "productivity-high"
                    );

                }

                else if (
                    day.percentage >= 40
                ) {

                    button.classList.add(
                        "productivity-medium"
                    );

                }

                else {

                    button.classList.add(
                        "productivity-low"
                    );

                }

            }


            button.innerHTML = `

                <span class="calendar-number">
                    ${day.date.getDate()}
                </span>

                ${
                    day.total > 0
                        ? `
                            <span class="calendar-dot"></span>
                          `
                        : ""
                }

            `;


            button.addEventListener(
                "click",
                async function() {

                    historySelectedDate =
                        dateString;


                    document
                        .querySelectorAll(
                            ".calendar-day"
                        )
                        .forEach(
                            function(item) {

                                item.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    button.classList.add(
                        "selected"
                    );


                    await loadHistorySelectedDay(
                        dateString
                    );

                }
            );


            calendar.appendChild(
                button
            );

        }
    );


    await loadHistorySelectedDay(
        historySelectedDate
    );

}


// ============================================================
// LOAD SELECTED DAY
// ============================================================

async function loadHistorySelectedDay(
    dateString
) {

    const tasks =
        await getTasksByDate(
            dateString
        );


    tasks.sort(
        function(a, b) {

            return (
                new Date(
                    a.createdAt
                ) -
                new Date(
                    b.createdAt
                )
            );

        }
    );


    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const pending =
        tasks.length -
        completed;


    const percentage =
        tasks.length === 0
            ? 0
            : Math.round(
                (
                    completed /
                    tasks.length
                ) * 100
            );


    const date =
        historyParseDate(
            dateString
        );


    const selectedDateElement =
        document.getElementById(
            "historySelectedDate"
        );


    if (
        selectedDateElement
    ) {

        selectedDateElement.textContent =
            date.toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }


    const percentageElement =
        document.getElementById(
            "historyPercentage"
        );


    if (
        percentageElement
    ) {

        percentageElement.textContent =
            `${percentage}%`;

    }


    const completedElement =
        document.getElementById(
            "historyCompleted"
        );


    if (
        completedElement
    ) {

        completedElement.textContent =
            completed;

    }


    const pendingElement =
        document.getElementById(
            "historyPending"
        );


    if (
        pendingElement
    ) {

        pendingElement.textContent =
            pending;

    }


    const list =
        document.getElementById(
            "historyTaskList"
        );


    if (!list) {
        return;
    }


    if (
        tasks.length === 0
    ) {

        list.innerHTML = `

            <div class="history-empty">

                <div>
                    💤
                </div>

                <strong>
                    No tasks for this day
                </strong>

                <p>
                    Nothing was recorded on this date.
                </p>

            </div>

        `;

        return;

    }


    list.innerHTML =
        tasks
            .map(
                function(task) {

                    return `

                        <div
                            class="
                                history-task
                                ${
                                    task.completed
                                        ? "completed"
                                        : ""
                                }
                            "
                        >

                            <span
                                class="history-task-check"
                            >
                                ${
                                    task.completed
                                        ? "✓"
                                        : ""
                                }
                            </span>

                            <span>
                                ${escapeHTML(
                                    task.title
                                )}
                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


// ============================================================
// MONTH NAVIGATION
// ============================================================

function historyPreviousMonth() {

    historyCurrentMonth =
        new Date(
            historyCurrentMonth.getFullYear(),
            historyCurrentMonth.getMonth() - 1,
            1
        );


    /*
        The old selected date could remain
        in the previous month.

        Now selecting a month always selects
        its first day.
    */

    historySelectedDate =
        historyFormatDate(
            historyCurrentMonth
        );


    renderHistoryCalendar();

}


function historyNextMonth() {

    historyCurrentMonth =
        new Date(
            historyCurrentMonth.getFullYear(),
            historyCurrentMonth.getMonth() + 1,
            1
        );


    historySelectedDate =
        historyFormatDate(
            historyCurrentMonth
        );


    renderHistoryCalendar();

}


function historyGoToToday() {

    const today =
        new Date();


    historyCurrentMonth =
        historyMonthStart(
            today
        );


    historySelectedDate =
        historyFormatDate(
            today
        );


    renderHistoryCalendar();

}


// ============================================================
// HISTORY INITIALIZATION
// ============================================================

function initializeHistory() {

    const previous =
        document.getElementById(
            "historyPrevious"
        );


    const next =
        document.getElementById(
            "historyNext"
        );


    const today =
        document.getElementById(
            "historyToday"
        );


    if (previous) {

        previous.addEventListener(
            "click",
            historyPreviousMonth
        );

    }


    if (next) {

        next.addEventListener(
            "click",
            historyNextMonth
        );

    }


    if (today) {

        today.addEventListener(
            "click",
            historyGoToToday
        );

    }

}
