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
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function historyParseDate(dateString) {

    const parts =
        dateString.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
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
    new Date();

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


    const previousMonthDays =
        firstWeekday;


    const days = [];


    // Previous month cells

    for (
        let i = previousMonthDays;
        i > 0;
        i--
    ) {

        const date =
            new Date(
                year,
                month,
                1 - i
            );


        days.push({

            date,

            currentMonth: false

        });

    }


    // Current month cells

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


        days.push({

            date,

            currentMonth: true

        });

    }


    // Next month cells

    while (
        days.length % 7 !== 0
    ) {

        const date =
            new Date(
                year,
                month,
                days.length -
                daysInMonth -
                previousMonthDays +
                1
            );


        days.push({

            date,

            currentMonth: false

        });

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


    const statistics =
        await Promise.all(

            days.map(
                async function(day) {

                    const dateString =
                        historyFormatDate(
                            day.date
                        );


                    const stats =
                        await getDailyStatistics(
                            dateString
                        );


                    return {

                        ...day,

                        ...stats

                    };

                }
            )

        );


    return statistics;

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


    const year =
        historyCurrentMonth.getFullYear();


    const month =
        historyCurrentMonth.getMonth();


    document.getElementById(
        "historyMonthTitle"
    ).textContent =
        `${historyMonthNames[month]} ${year}`;


    const days =
        await getHistoryMonthStatistics(
            year,
            month
        );


    calendar.innerHTML = "";


    days.forEach(
        function(day) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "calendar-day";


            if (
                !day.currentMonth
            ) {

                button.classList.add(
                    "outside-month"
                );

            }


            const today =
                historyFormatDate(
                    new Date()
                );


            const dateString =
                historyFormatDate(
                    day.date
                );


            if (
                dateString === today
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
                            <span class="calendar-dot">
                            </span>
                          `
                        : ""
                }

            `;


            button.addEventListener(
                "click",
                function() {

                    historySelectedDate =
                        dateString;


                    document
                        .querySelectorAll(
                            ".calendar-day"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "selected"
                                )
                        );


                    button.classList.add(
                        "selected"
                    );


                    loadHistorySelectedDay(
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

            return new Date(
                a.createdAt
            ) -
            new Date(
                b.createdAt
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


    document.getElementById(
        "historySelectedDate"
    ).textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "historyPercentage"
    ).textContent =
        `${percentage}%`;


    document.getElementById(
        "historyCompleted"
    ).textContent =
        completed;


    document.getElementById(
        "historyPending"
    ).textContent =
        pending;


    const list =
        document.getElementById(
            "historyTaskList"
        );


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

                        <div class="
                            history-task
                            ${
                                task.completed
                                    ? "completed"
                                    : ""
                            }
                        ">

                            <span class="
                                history-task-check
                            ">

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

    historyCurrentMonth.setMonth(
        historyCurrentMonth.getMonth() - 1
    );


    renderHistoryCalendar();

}


function historyNextMonth() {

    historyCurrentMonth.setMonth(
        historyCurrentMonth.getMonth() + 1
    );


    renderHistoryCalendar();

}


function historyGoToToday() {

    historyCurrentMonth =
        new Date();

    historySelectedDate =
        historyFormatDate(
            new Date()
        );


    renderHistoryCalendar();

}


// ============================================================
// ESCAPE HTML
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