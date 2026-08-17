// ============================================================
// TASKFLOW - STATISTICS ENGINE
// ============================================================


// ============================================================
// DATE HELPERS
// ============================================================

function getDateString(date) {

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


function parseStatisticsDate(
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


function getDateDaysAgo(days) {

    const date =
        new Date();


    date.setHours(
        0,
        0,
        0,
        0
    );


    date.setDate(
        date.getDate() -
        days
    );


    return date;

}


function getTodayStatisticsDate() {

    return getDateString(
        new Date()
    );

}


// ============================================================
// BUILD DAILY STATISTICS
// ============================================================

function buildDailyStatistics(
    dateString,
    tasks
) {

    const dateTasks =
        tasks.filter(
            function(task) {

                return (
                    task.date ===
                    dateString
                );

            }
        );


    const total =
        dateTasks.length;


    const completed =
        dateTasks.filter(
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

        date:
            dateString,

        total,

        completed,

        pending,

        percentage

    };

}


// ============================================================
// DAILY STATISTICS
// ============================================================

async function getDailyStatistics(
    dateString
) {

    const tasks =
        await getTasksByDate(
            dateString
        );


    return buildDailyStatistics(
        dateString,
        tasks
    );

}


// ============================================================
// LAST 7 DAYS
// ============================================================

async function getLast7DaysStatistics(
    tasks = null
) {

    const allTasks =
        tasks ||
        await getAllTasks();


    const result = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            getDateDaysAgo(
                i
            );


        const dateString =
            getDateString(
                date
            );


        result.push(
            buildDailyStatistics(
                dateString,
                allTasks
            )
        );

    }


    return result;

}


// ============================================================
// LAST 30 DAYS
// ============================================================

async function getLast30DaysStatistics(
    tasks = null
) {

    const allTasks =
        tasks ||
        await getAllTasks();


    const result = [];


    for (
        let i = 29;
        i >= 0;
        i--
    ) {

        const date =
            getDateDaysAgo(
                i
            );


        const dateString =
            getDateString(
                date
            );


        result.push(
            buildDailyStatistics(
                dateString,
                allTasks
            )
        );

    }


    return result;

}


// ============================================================
// SUMMARY HELPER
// ============================================================

function summarizeDays(
    days
) {

    const totalTasks =
        days.reduce(
            (
                sum,
                day
            ) =>
                sum +
                day.total,
            0
        );


    const completedTasks =
        days.reduce(
            (
                sum,
                day
            ) =>
                sum +
                day.completed,
            0
        );


    const pendingTasks =
        totalTasks -
        completedTasks;


    const percentage =
        totalTasks === 0
            ? 0
            : Math.round(
                (
                    completedTasks /
                    totalTasks
                ) * 100
            );


    const activeDays =
        days.filter(
            day =>
                day.total > 0
        ).length;


    const bestDay =
        days.reduce(
            function(
                best,
                current
            ) {

                if (
                    current.total === 0
                ) {

                    return best;

                }


                if (
                    !best ||
                    current.percentage >
                        best.percentage ||
                    (
                        current.percentage ===
                            best.percentage &&
                        current.completed >
                            best.completed
                    )
                ) {

                    return current;

                }


                return best;

            },
            null
        );


    return {

        days,

        totalTasks,

        completedTasks,

        pendingTasks,

        percentage,

        activeDays,

        bestDay

    };

}


// ============================================================
// WEEKLY SUMMARY
// ============================================================

async function getWeeklySummary(
    tasks = null
) {

    const days =
        await getLast7DaysStatistics(
            tasks
        );


    return summarizeDays(
        days
    );

}


// ============================================================
// MONTHLY SUMMARY
// ============================================================

async function getMonthlySummary(
    tasks = null
) {

    const days =
        await getLast30DaysStatistics(
            tasks
        );


    return summarizeDays(
        days
    );

}


// ============================================================
// ALL-TIME SUMMARY
// Future tasks excluded.
// ============================================================

async function getAllTimeSummary(
    tasks = null
) {

    const allTasks =
        tasks ||
        await getAllTasks();


    const today =
        getTodayStatisticsDate();


    const recordedTasks =
        allTasks.filter(
            function(task) {

                return (
                    task.date <=
                    today
                );

            }
        );


    const totalTasks =
        recordedTasks.length;


    const completedTasks =
        recordedTasks.filter(
            task =>
                task.completed
        ).length;


    const pendingTasks =
        totalTasks -
        completedTasks;


    const percentage =
        totalTasks === 0
            ? 0
            : Math.round(
                (
                    completedTasks /
                    totalTasks
                ) * 100
            );


    return {

        totalTasks,

        completedTasks,

        pendingTasks,

        percentage

    };

}


// ============================================================
// BEST DAY
// ============================================================

async function getBestProductivityDay(
    tasks = null
) {

    const days =
        await getLast30DaysStatistics(
            tasks
        );


    return days.reduce(
        function(
            best,
            current
        ) {

            if (
                current.total === 0
            ) {

                return best;

            }


            if (
                !best ||
                current.percentage >
                    best.percentage ||
                (
                    current.percentage ===
                        best.percentage &&
                    current.completed >
                        best.completed
                )
            ) {

                return current;

            }


            return best;

        },
        null
    );

}


// ============================================================
// AVERAGE DAILY COMPLETION
// ============================================================

async function getAverageDailyCompletion(
    tasks = null
) {

    const days =
        await getLast30DaysStatistics(
            tasks
        );


    const activeDays =
        days.filter(
            day =>
                day.total > 0
        );


    if (
        activeDays.length === 0
    ) {

        return 0;

    }


    const totalPercentage =
        activeDays.reduce(
            (
                sum,
                day
            ) =>
                sum +
                day.percentage,
            0
        );


    return Math.round(
        totalPercentage /
        activeDays.length
    );

}


// ============================================================
// STREAK RULE
// ============================================================

const STREAK_COMPLETION_THRESHOLD =
    80;


function qualifiesForStreak(
    stats
) {

    if (
        stats.total === 0
    ) {

        return false;

    }


    return (
        stats.completed /
        stats.total
    ) >=
    (
        STREAK_COMPLETION_THRESHOLD /
        100
    );

}


// ============================================================
// CURRENT STREAK
// ============================================================

async function calculateCurrentStreak(
    tasks = null
) {

    const allTasks =
        tasks ||
        await getAllTasks();


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const todayStats =
        buildDailyStatistics(
            getDateString(
                today
            ),
            allTasks
        );


    if (
        todayStats.total > 0
    ) {

        if (
            !qualifiesForStreak(
                todayStats
            )
        ) {

            return 0;

        }

    }

    else {

        today.setDate(
            today.getDate() - 1
        );

    }


    let streak =
        0;


    while (true) {

        const dateString =
            getDateString(
                today
            );


        const stats =
            buildDailyStatistics(
                dateString,
                allTasks
            );


        if (
            !qualifiesForStreak(
                stats
            )
        ) {

            break;

        }


        streak++;


        today.setDate(
            today.getDate() - 1
        );

    }


    return streak;

}


// ============================================================
// LONGEST STREAK
// ============================================================

async function calculateLongestStreak(
    tasks = null
) {

    const allTasks =
        tasks ||
        await getAllTasks();


    const todayString =
        getTodayStatisticsDate();


    const recordedTasks =
        allTasks.filter(
            function(task) {

                return (
                    task.date <=
                    todayString
                );

            }
        );


    if (
        recordedTasks.length === 0
    ) {

        return 0;

    }


    let earliestDate =
        null;


    recordedTasks.forEach(
        function(task) {

            const date =
                parseStatisticsDate(
                    task.date
                );


            if (
                !earliestDate ||
                date < earliestDate
            ) {

                earliestDate =
                    date;

            }

        }
    );


    if (!earliestDate) {

        return 0;

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    let longest =
        0;


    let current =
        0;


    const cursor =
        new Date(
            earliestDate
        );


    while (
        cursor <= today
    ) {

        const stats =
            buildDailyStatistics(
                getDateString(
                    cursor
                ),
                recordedTasks
            );


        if (
            qualifiesForStreak(
                stats
            )
        ) {

            current++;


            longest =
                Math.max(
                    longest,
                    current
                );

        }

        else {

            current = 0;

        }


        cursor.setDate(
            cursor.getDate() + 1
        );

    }


    return longest;

}


// ============================================================
// PRODUCTIVITY SCORE
// ============================================================

function calculateProductivityScore(
    weekly,
    currentStreak
) {

    if (
        weekly.totalTasks === 0
    ) {

        return 0;

    }


    const streakBonus =
        Math.min(
            currentStreak * 2,
            10
        );


    return Math.min(
        Math.round(
            weekly.percentage +
            streakBonus
        ),
        100
    );

}


// ============================================================
// COMPLETE STATISTICS DASHBOARD
// ============================================================

async function getStatisticsDashboardData() {

    /*
        Read all tasks once and perform
        the dashboard calculations in memory.
    */

    const allTasks =
        await getAllTasks();


    const weekly =
        await getWeeklySummary(
            allTasks
        );


    const monthly =
        await getMonthlySummary(
            allTasks
        );


    const allTime =
        await getAllTimeSummary(
            allTasks
        );


    const bestDay =
        await getBestProductivityDay(
            allTasks
        );


    const average =
        await getAverageDailyCompletion(
            allTasks
        );


    const currentStreak =
        await calculateCurrentStreak(
            allTasks
        );


    const longestStreak =
        await calculateLongestStreak(
            allTasks
        );


    const productivityScore =
        calculateProductivityScore(
            weekly,
            currentStreak
        );


    return {

        weekly,

        monthly,

        allTime,

        bestDay,

        average,

        currentStreak,

        longestStreak,

        productivityScore

    };

}
