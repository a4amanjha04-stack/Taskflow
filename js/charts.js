// ============================================================
// TASKFLOW - CHARTS
// ============================================================

let todayChart = null;
let weeklyChart = null;
let monthlyChart = null;


// ============================================================
// TODAY DOUGHNUT
// ============================================================

function createTodayChart(stats) {

    const canvas =
        document.getElementById("todayChart");

    if (!canvas) return;

    if (todayChart) {
        todayChart.destroy();
    }

    todayChart = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [
                "Completed",
                "Pending"
            ],

            datasets: [{

                data: [
                    stats.completed,
                    stats.pending
                ],

                backgroundColor: [
                    "#6366f1",
                    "#e5e7eb"
                ],

                borderWidth: 0,

                hoverOffset: 5

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            cutout: "72%",

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        usePointStyle: true,

                        padding: 18

                    }

                }

            }

        }

    });

}


// ============================================================
// WEEKLY LINE CHART
// ============================================================

function createWeeklyChart(days) {

    const canvas =
        document.getElementById("weeklyChart");

    if (!canvas) return;

    if (weeklyChart) {
        weeklyChart.destroy();
    }


    const labels =
        days.map(day => {

            const date =
                new Date(
                    day.date + "T00:00:00"
                );

            return date.toLocaleDateString(
                "en-IN",
                {
                    weekday: "short"
                }
            );

        });


    const values =
        days.map(
            day => day.percentage
        );


    weeklyChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label:
                    "Completion %",

                data: values,

                borderColor:
                    "#6366f1",

                backgroundColor:
                    "rgba(99,102,241,0.12)",

                borderWidth: 3,

                fill: true,

                tension: 0.4,

                pointRadius: 4,

                pointHoverRadius: 6,

                pointBackgroundColor:
                    "#6366f1"

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {

                intersect: false,

                mode: "index"

            },

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    max: 100,

                    ticks: {

                        callback:
                            value => value + "%"

                    },

                    grid: {

                        color:
                            "rgba(128,128,128,0.12)"

                    }

                },

                x: {

                    grid: {

                        display: false

                    }

                }

            }

        }

    });

}


// ============================================================
// MONTHLY BAR CHART
// ============================================================

function createMonthlyChart(days) {

    const canvas =
        document.getElementById("monthlyChart");

    if (!canvas) return;

    if (monthlyChart) {
        monthlyChart.destroy();
    }


    const labels =
        days.map(day => {

            const date =
                new Date(
                    day.date + "T00:00:00"
                );

            return date.getDate();

        });


    const values =
        days.map(
            day => day.percentage
        );


    monthlyChart = new Chart(canvas, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label:
                    "Completion %",

                data: values,

                backgroundColor:
                    "#6366f1",

                borderRadius: 5,

                borderSkipped: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    max: 100,

                    ticks: {

                        callback:
                            value => value + "%"

                    }

                },

                x: {

                    grid: {

                        display: false

                    }

                }

            }

        }

    });

}