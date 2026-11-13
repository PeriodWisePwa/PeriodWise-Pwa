
// ==========================================
// PERIODWISE ADVANCED BBT CHART
// ==========================================

(function () {

    function getDayNumber(dateString) {
        const parts = dateString.split("-").map(Number);

        return Math.floor(
            (Date.UTC(parts[0], parts[1] - 1, parts[2]) -
             Date.UTC(1970, 0, 1)) / 86400000
        );
    }

    function getCycleDay(dateString, cycles) {

        const recordDay = getDayNumber(dateString);

        const previousCycles = cycles
            .filter(cycle =>
                cycle.startDate &&
                getDayNumber(cycle.startDate) <= recordDay
            )
            .sort((a, b) =>
                b.startDate.localeCompare(a.startDate)
            );

        if (!previousCycles.length) return null;

        return recordDay -
            getDayNumber(previousCycles[0].startDate) + 1;
    }

    async function drawAdvancedBBTChart() {

        const card = document.getElementById(
            "advancedBbtChartCard"
        );

        const canvas = document.getElementById(
            "advancedBbtChart"
        );

        const message = document.getElementById(
            "bbtChartMessage"
        );

        if (!card || !canvas || !message) return;

        try {

            const records = await PeriodWiseDB.getAll(
                "bbtRecords"
            );

            const cycles = await PeriodWiseDB.getAll(
                "cycleRecords"
            );

            const readings = records
                .filter(record =>
                    record.date &&
                    Number.isFinite(Number(record.temperature))
                )
                .map(record => ({
                    date: record.date,
                    temperature: record.unit === "F"
                        ? (Number(record.temperature) - 32) * 5 / 9
                        : Number(record.temperature)
                }))
                .sort((a, b) =>
                    a.date.localeCompare(b.date)
                );

            if (!readings.length) {

                message.textContent =
                    "No BBT readings are available yet. Add temperature readings in your BBT tracker to build your chart.";

                canvas.style.display = "none";
                return;
            }

            canvas.style.display = "block";
            message.textContent =
                "Your readings are displayed in Celsius. Fahrenheit entries are converted automatically.";

            const width = Math.max(
                canvas.parentElement.clientWidth,
                300
            );

            const height = 320;
            const ratio = window.devicePixelRatio || 1;

            canvas.width = width * ratio;
            canvas.height = height * ratio;
            canvas.style.width = "100%";
            canvas.style.height = height + "px";

            const ctx = canvas.getContext("2d");

            ctx.setTransform(
                ratio, 0, 0, ratio, 0, 0
            );

            const left = 48;
            const right = width - 16;
            const top = 24;
            const bottom = height - 65;

            const values = readings.map(r => r.temperature);

            let min = Math.floor(Math.min(...values) * 2) / 2;
            let max = Math.ceil(Math.max(...values) * 2) / 2;

            if (min === max) {
                min -= 0.5;
                max += 0.5;
            }

            min -= 0.25;
            max += 0.25;

            const xPosition = index =>
                readings.length === 1
                    ? (left + right) / 2
                    : left + index *
                        (right - left) /
                        (readings.length - 1);

            const yPosition = value =>
                bottom -
                ((value - min) / (max - min)) *
                (bottom - top);

            ctx.clearRect(0, 0, width, height);

            ctx.font = "12px Arial";
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";

            // Temperature grid lines
            for (let i = 0; i <= 4; i++) {

                const value = min +
                    (max - min) * i / 4;

                const y = yPosition(value);

                ctx.beginPath();
                ctx.moveTo(left, y);
                ctx.lineTo(right, y);
                ctx.strokeStyle = "#dddddd";
                ctx.stroke();

                ctx.fillStyle = "#666666";
                ctx.fillText(
                    value.toFixed(1) + "°C",
                    left - 8,
                    y
                );
            }

            // Temperature line
            ctx.beginPath();

            readings.forEach((reading, index) => {

                const x = xPosition(index);
                const y = yPosition(reading.temperature);

                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

            });

            ctx.strokeStyle = "#e91e63";
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Reading points
            readings.forEach((reading, index) => {

                const x = xPosition(index);
                const y = yPosition(reading.temperature);

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#e91e63";
                ctx.fill();

            });

            // Date and cycle-day labels
            const labelStep = Math.max(
                1,
                Math.ceil(readings.length / 7)
            );

            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#666666";
            ctx.font = "10px Arial";

            readings.forEach((reading, index) => {

                if (
                    index % labelStep !== 0 &&
                    index !== readings.length - 1
                ) return;

                const x = xPosition(index);
                const dateLabel = reading.date.slice(5);

                ctx.fillText(
                    dateLabel,
                    x,
                    bottom + 10
                );

                const cycleDay = getCycleDay(
                    reading.date,
                    cycles
                );

                if (cycleDay !== null) {
                    ctx.fillText(
                        "CD " + cycleDay,
                        x,
                        bottom + 27
                    );
                }

            });

        } catch (error) {

            console.error(
                "Advanced BBT chart error:",
                error
            );

            message.textContent =
                "Unable to load your BBT chart. Please try again.";

        }

    }

    function initialiseAdvancedBBTChart() {

        const checkButton = document.getElementById(
            "checkTtcAccessButton"
        );

        const card = document.getElementById(
            "advancedBbtChartCard"
        );

        if (!checkButton || !card) return;

        checkButton.addEventListener("click", async function () {

            card.style.display = "none";

            try {

                const access =
                    await window.PeriodWiseEntitlements
                        .checkTtcHubAccess();

                if (!access.hasAccess) return;

                card.style.display = "block";

                await drawAdvancedBBTChart();

            } catch (error) {

                console.error(
                    "Unable to verify BBT chart access:",
                    error
                );

                card.style.display = "none";

            }

        });

    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initialiseAdvancedBBTChart
        );

    } else {

        initialiseAdvancedBBTChart();

    }

})();
