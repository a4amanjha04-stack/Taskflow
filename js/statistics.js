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
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ============================================================
// GET DATE FROM DAYS AGO
// ============================================================

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
        date.getDate() - days
    );

    return date;

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

        date: dateString,

        total,

        completed,

        pending,

        percentage

    };

}


// ============================================================
// LAST 7 DAYS
// ============================================================

async function getLast7DaysStatistics() {

    const result = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            getDateDaysAgo(i);


        const dateString =
            getDateString(date);


        const statistics =
            await getDailyStatistics(
                dateString
            );


        result.push(
            statistics
        );

    }


    return result;

}


// ============================================================
// LAST 30 DAYS
// ============================================================

async function getLast30DaysStatistics() {

    const result = [];


    for (
        let i = 29;
        i >= 0;
        i--
    ) {

        const date =
            getDateDaysAgo(i);


        const dateString =
            getDateString(date);


        const statistics =
            await getDailyStatistics(
                dateString
            );


        result.push(
            statistics
        );

    }


    return result;

}


// ============================================================
// WEEKLY SUMMARY
// ============================================================

async function getWeeklySummary() {

    const days =
        await getLast7DaysStatistics();


    const totalTasks =
        days.reduce(
            (sum, day) =>
                sum + day.total,
            0
        );


    const completedTasks =
        days.reduce(
            (sum, day) =>
                sum + day.completed,
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
            function(best, current) {

                if (
                    current.total === 0
                ) {

                    return best;

                }


                if (
                    !best ||
                    current.percentage >
                    best.percentage
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
// MONTHLY SUMMARY
// ============================================================

async function getMonthlySummary() {

    const days =
        await getLast30DaysStatistics();


    const totalTasks =
        days.reduce(
            (sum, day) =>
                sum + day.total,
            0
        );


    const completedTasks =
        days.reduce(
            (sum, day) =>
                sum + day.completed,
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
            function(best, current) {

                if (
                    current.total === 0
                ) {

                    return best;

                }


                if (
                    !best ||
                    current.percentage >
                    best.percentage
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
// ALL-TIME SUMMARY
// ============================================================

async function getAllTimeSummary() {

    const tasks =
        await getAllTasks();


    const totalTasks =
        tasks.length;


    const completedTasks =
        tasks.filter(
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

async function getBestProductivityDay() {

    const days =
        await getLast30DaysStatistics();


    const activeDays =
        days.filter(
            day =>
                day.total > 0
        );


    if (
        activeDays.length === 0
    ) {

        return null;

    }


    return activeDays.reduce(
        function(best, current) {

            if (
                current.percentage >
                best.percentage
            ) {

                return current;

            }


            return best;

        }
    );

}


// ============================================================
// AVERAGE DAILY COMPLETION
// ============================================================

async function getAverageDailyCompletion() {

    const days =
        await getLast30DaysStatistics();


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
            (sum, day) =>
                sum + day.percentage,
            0
        );


    return Math.round(
        totalPercentage /
        activeDays.length
    );

}


// ============================================================
// CURRENT STREAK
// ============================================================




// ============================================================
// LONGEST STREAK
// ============================================================
// ============================================================
// STREAK RULE
// A day counts when at least 80% of its tasks are completed.
// ============================================================

const STREAK_COMPLETION_THRESHOLD = 80;


// ============================================================
// CHECK WHETHER A DAY QUALIFIES FOR STREAK
// ============================================================

async function isStreakDay(dateString) {

    const stats =
        await getDailyStatistics(
            dateString
        );


    // No tasks = not a productivity day

    if (stats.total === 0) {

        return false;

    }


    return (
        stats.percentage >=
        STREAK_COMPLETION_THRESHOLD
    );

}


// ============================================================
// CURRENT STREAK
// ============================================================

async function calculateCurrentStreak() {

    let streak = 0;


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    // Check today first

    const todayString =
        getDateString(today);


    const todayStats =
        await getDailyStatistics(
            todayString
        );


    /*
        If today has tasks and isn't
        completed enough, the streak
        is currently broken.

        If today has no tasks yet,
        we check from yesterday.
    */

    if (
        todayStats.total > 0
    ) {

        if (
            todayStats.percentage <
            STREAK_COMPLETION_THRESHOLD
        ) {

            return 0;

        }

    }

    else {

        today.setDate(
            today.getDate() - 1
        );

    }


    while (true) {

        const dateString =
            getDateString(today);


        const qualifies =
            await isStreakDay(
                dateString
            );


        if (!qualifies) {

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

async function calculateLongestStreak() {

    const allTasks =
        await getAllTasks();


    if (
        allTasks.length === 0
    ) {

        return 0;

    }


    // Find earliest task date

    let earliestDate =
        null;


    allTasks.forEach(
        function(task) {

            const date =
                statisticsSafeDate(
                    task.date
                );


            if (
                !earliestDate ||
                date < earliestDate
            ) {

                earliestDate = date;

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


    let longest = 0;

    let current = 0;


    const cursor =
        new Date(
            earliestDate
        );


    while (
        cursor <= today
    ) {

        const dateString =
            getDateString(
                cursor
            );


        const qualifies =
            await isStreakDay(
                dateString
            );


        if (qualifies) {

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
// SAFE DATE PARSER
// ============================================================

function statisticsSafeDate(
    dateString
) {

    const parts =
        dateString.split("-");


    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

}


// ============================================================
// PRODUCTIVITY SCORE
// ============================================================

// ============================================================
// PRODUCTIVITY SCORE
// ============================================================

async function getProductivityScore() {

    const weekly =
        await getWeeklySummary();


    const streak =
        await calculateCurrentStreak();


    if (
        weekly.totalTasks === 0
    ) {

        return 0;

    }


    /*
        Base score:
        Weekly completion percentage

        Streak bonus:
        2 points per qualifying streak day

        Maximum bonus:
        10 points

        Maximum score:
        100
    */

    const streakBonus =
        Math.min(
            streak * 2,
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
// COMPLETE STATISTICS DASHBOARD DATA
// ============================================================

async function getStatisticsDashboardData() {

    const [
        weekly,
        monthly,
        allTime,
        bestDay,
        average,
        currentStreak,
        longestStreak,
        productivityScore
    ] =
        await Promise.all([
            getWeeklySummary(),
            getMonthlySummary(),
            getAllTimeSummary(),
            getBestProductivityDay(),
            getAverageDailyCompletion(),
            calculateCurrentStreak(),
            calculateLongestStreak(),
            getProductivityScore()
        ]);


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