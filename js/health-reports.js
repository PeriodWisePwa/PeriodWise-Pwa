
const PeriodWiseHealthReports = {

  // Retrieve all cycle records
  async getCycleRecords() {
    return await PeriodWiseCycle.getHistory();
  },

  // Retrieve all fertility records
  async getFertilityRecords() {

    const [
      bbt,
      lh,
      pregnancyTests,
      observations
    ] = await Promise.all([

      PeriodWiseFertility.getBBT(),
      PeriodWiseFertility.getLH(),
      PeriodWiseFertility.getPregnancyTests(),
      PeriodWiseFertility.getObservations()

    ]);

    return {
      bbt,
      lh,
      pregnancyTests,
      observations
    };

  },

  // Calculate cycle history statistics
  async getCycleSummary() {

    const records = await this.getCycleRecords();

    if (!records.length) {
      return {
        totalCycles: 0,
        averageCycleLength: null,
        shortestCycle: null,
        longestCycle: null,
        averagePeriodLength: null
      };
    }

    const cycleLengths = records.map(record =>
      Number(record.cycleLength)
    );

    const periodLengths = records.map(record =>
      Number(record.periodLength)
    );

    const average = values =>
      Math.round(
        (values.reduce((sum, value) => sum + value, 0) /
        values.length) * 10
      ) / 10;

    return {
      totalCycles: records.length,
      averageCycleLength: average(cycleLengths),
      shortestCycle: Math.min(...cycleLengths),
      longestCycle: Math.max(...cycleLengths),
      averagePeriodLength: average(periodLengths)
    };

  },

  // Generate printable cycle history report
  async generateCycleReport() {

    const records = await this.getCycleRecords();

    if (!records.length) {
      throw new Error("No cycle records available for this report.");
    }

    const summary = await this.getCycleSummary();

    return {
      generatedAt: new Date().toISOString(),

      summary,

      records: records.map(record => ({
        startDate: record.startDate,
        periodLength: Number(record.periodLength),
        cycleLength: Number(record.cycleLength)
      }))
    };

  },

  // Display cycle report preview
  async renderCycleReportPreview() {

    const report = await this.generateCycleReport();

    const preview =
      document.getElementById("cycleReportPreview");

    if (!preview) return;

    const formatDate = date =>
      new Date(date + "T12:00:00").toLocaleDateString();

    preview.innerHTML = `
      <hr>

      <h2>PeriodWise</h2>
<p><strong>Understand Your Cycle. Understand Your Health.</strong></p>

<h3>Cycle History Report</h3>

      <p><strong>Generated:</strong>
        ${new Date(report.generatedAt).toLocaleDateString()}
      </p>

      <h4>Cycle Summary</h4>

      <p>Total recorded cycles: ${report.summary.totalCycles}</p>
      <p>Average cycle length: ${report.summary.averageCycleLength} days</p>
      <p>Shortest cycle: ${report.summary.shortestCycle} days</p>
      <p>Longest cycle: ${report.summary.longestCycle} days</p>
      <p>Average period duration: ${report.summary.averagePeriodLength} days</p>

      <h4>Recorded Cycle History</h4>

      <table>
        <thead>
          <tr>
            <th>Period start date</th>
            <th>Period duration</th>
            <th>Cycle length</th>
          </tr>
        </thead>

        <tbody>
          ${report.records.map(record => `
            <tr>
              <td>${formatDate(record.startDate)}</td>
              <td>${record.periodLength} days</td>
              <td>${record.cycleLength} days</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <p>
        <strong>Important information:</strong>
        This report summarises information recorded by the user.
        Cycle lengths are based on user-entered values and are
        not medical diagnoses or predictions.
      </p>
      
    `;

    preview.hidden = false;

    const printButton =
  document.getElementById("printCycleReportButton");

if (printButton) {
  printButton.hidden = false;
}

  },

  
  // Display fertility report preview
  async renderFertilityReportPreview() {
    const report = await this.generateFertilityReport();
    const preview = document.getElementById("fertilityReportPreview");

    if (!preview) {
      throw new Error("Fertility report preview area not found.");
    }

    const escapeHtml = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]);

    const formatDate = (date) => {
      if (!date) return "Not available";
      return new Date(date + "T12:00:00").toLocaleDateString();
    };

    const formatTable = (headers, rows) => {
      if (!rows.length) {
        return "<p>No records available.</p>";
      }

      return `
        <table>
          <thead>
            <tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(value => `<td>${escapeHtml(value)}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    };

    const records = report.records;
    const summary = report.summary;

    preview.innerHTML = `
      <h2>PeriodWise</h2>
      <p>Understand Your Cycle. Understand Your Health.</p>
      <h3>Fertility Records &amp; Reports</h3>
      <p>Generated: ${escapeHtml(new Date(report.generatedAt).toLocaleString())}</p>

      <h4>Fertility Records Summary</h4>
      <p>BBT records: ${summary.totalBBTRecords}</p>
      <p>LH tests: ${summary.totalLHTests}</p>
      <p>Positive LH tests: ${summary.positiveLHTests}</p>
      <p>Pregnancy tests: ${summary.totalPregnancyTests}</p>
      <p>Positive pregnancy tests: ${summary.positivePregnancyTests}</p>
      <p>Fertility observations: ${summary.totalObservations}</p>

      <h4>Basal Body Temperature (BBT) Records</h4>
      ${formatTable(
        ["Date", "Temperature", "Unit", "Notes"],
        records.bbt.map(record => [
          formatDate(record.date),
          record.temperature,
          record.unit,
          record.notes
        ])
      )}

      <h4>LH Test Records</h4>
      ${formatTable(
        ["Date", "Result", "Notes"],
        records.lh.map(record => [
          formatDate(record.date),
          record.result,
          record.notes
        ])
      )}

      <h4>Pregnancy Test Records</h4>
      ${formatTable(
        ["Date", "Result", "Notes"],
        records.pregnancyTests.map(record => [
          formatDate(record.date),
          record.result,
          record.notes
        ])
      )}

      <h4>Fertility Observations</h4>
      ${formatTable(
        ["Date", "Category", "Observation", "Notes"],
        records.observations.map(record => [
          formatDate(record.date),
          record.category,
          record.observation,
          record.notes
        ])
      )}

      <p>
        <strong>Important information:</strong>
        This report summarises fertility information recorded by the user.
        Test results and observations are personal records and should not
        be interpreted as medical diagnoses.
      </p>
    `;

    preview.hidden = false;

    const printButton =
      document.getElementById("printFertilityReportButton");

    if (printButton) {
      printButton.hidden = false;
    }
  },

  // Calculate fertility record summaries
  async getFertilitySummary() {

    const records = await this.getFertilityRecords();

    return {
      totalBBTRecords: records.bbt.length,

      totalLHTests: records.lh.length,

      positiveLHTests: records.lh.filter(
        record => record.result === "positive"
      ).length,

      totalPregnancyTests: records.pregnancyTests.length,

      positivePregnancyTests: records.pregnancyTests.filter(
        record => record.result === "positive"
      ).length,

      totalObservations: records.observations.length
        };

  },

  // Generate combined cycle and fertility records report
  async generateFertilityReport() {
    const cycleRecords = await this.getCycleRecords();
    const cycleSummary = await this.getCycleSummary();

    const records = await this.getFertilityRecords();
    const summary = await this.getFertilitySummary();

    const hasCycleRecords = cycleRecords.length > 0;

    const hasFertilityRecords =
      records.bbt.length ||
      records.lh.length ||
      records.pregnancyTests.length ||
      records.observations.length;

    if (!hasCycleRecords && !hasFertilityRecords) {
      throw new Error(
        "No cycle or fertility records available for this report."
      );
    }

    return {
      generatedAt: new Date().toISOString(),

      cycleSummary,

      cycleRecords: cycleRecords.map(record => ({
        startDate: record.startDate,
        periodLength: Number(record.periodLength),
        cycleLength: Number(record.cycleLength)
      })),

      summary,
      records
    };
  },

  // Display report summaries on the Health Reports page
  async renderSummaries() {
    try {

      if (!PeriodWiseDB.database) {
        await PeriodWiseDB.open();
      }

      const [
        cycleSummary,
        fertilitySummary
      ] = await Promise.all([
        this.getCycleSummary(),
        this.getFertilitySummary()
      ]);

      const cycleContainer =
        document.getElementById("cycleReportSummary");

      const fertilityContainer =
        document.getElementById("fertilityReportSummary");

      if (!cycleContainer || !fertilityContainer) {
        return;
      }

      cycleContainer.innerHTML = `
        <p><strong>Total recorded cycles:</strong>
          ${cycleSummary.totalCycles}</p>
        <p><strong>Average cycle length:</strong>
          ${cycleSummary.averageCycleLength ?? "Not available"} days</p>
        <p><strong>Shortest cycle:</strong>
          ${cycleSummary.shortestCycle ?? "Not available"} days</p>
        <p><strong>Longest cycle:</strong>
          ${cycleSummary.longestCycle ?? "Not available"} days</p>
        <p><strong>Average period duration:</strong>
          ${cycleSummary.averagePeriodLength ?? "Not available"} days</p>
      `;

      fertilityContainer.innerHTML = `
        <p><strong>BBT records:</strong>
          ${fertilitySummary.totalBBTRecords}</p>
        <p><strong>LH tests:</strong>
          ${fertilitySummary.totalLHTests}</p>
        <p><strong>Positive LH tests:</strong>
          ${fertilitySummary.positiveLHTests}</p>
        <p><strong>Pregnancy tests:</strong>
          ${fertilitySummary.totalPregnancyTests}</p>
        <p><strong>Positive pregnancy tests:</strong>
          ${fertilitySummary.positivePregnancyTests}</p>
        <p><strong>Fertility observations:</strong>
          ${fertilitySummary.totalObservations}</p>
      `;

    } catch (error) {

      console.error("Health Reports loading failed:", error);

      const cycleContainer =
        document.getElementById("cycleReportSummary");

      const fertilityContainer =
        document.getElementById("fertilityReportSummary");

      if (cycleContainer) {
        cycleContainer.textContent =
          "Unable to load cycle reports. Please try again.";
      }

      if (fertilityContainer) {
        fertilityContainer.textContent =
          "Unable to load fertility reports. Please try again.";
      }

    }

  },

};


// Connect Cycle History Report preview button
document.addEventListener("click", async function(event) {

  if (event.target.id !== "generateCycleReportButton") {
    return;
  }

  const preview =
    document.getElementById("cycleReportPreview");

  try {

    await PeriodWiseHealthReports.renderCycleReportPreview();

  } catch (error) {

    console.error("Cycle report preview failed:", error);

    if (preview) {
      preview.hidden = false;
      preview.textContent =
        error.message || "Unable to generate cycle report.";
    }

  }

});

// Connect Cycle History Report print button
document.addEventListener("click", function(event) {

  if (event.target.id !== "printCycleReportButton") {
    return;
  }

  const preview =
    document.getElementById("cycleReportPreview");

  if (!preview || preview.hidden) {
    return;
  }

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow pop-ups to print your report.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>PeriodWise Cycle History Report</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          color: #333;
        }

        h3, h4 {
          color: #e91e63;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }

        th {
          background: #fce4ec;
        }

        @media print {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>

    <body>
      ${preview.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = function() {
    printWindow.focus();
    printWindow.print();
  };

});


// Connect Fertility Records & Reports preview button
document.addEventListener("click", async function(event) {
  if (event.target.id !== "generateFertilityReportButton") return;

  const preview = document.getElementById("fertilityReportPreview");

  try {
    await PeriodWiseHealthReports.renderFertilityReportPreview();
  } catch (error) {
    console.error("Fertility report preview failed:", error);

    if (preview) {
      preview.hidden = false;
      preview.textContent =
        error.message || "Unable to generate fertility report.";
    }
  }
});


// Connect Fertility Records & Reports print button
document.addEventListener("click", function(event) {
  if (event.target.id !== "printFertilityReportButton") return;

  const preview = document.getElementById("fertilityReportPreview");

  if (!preview || preview.hidden) return;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow pop-ups to print your report.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>PeriodWise Fertility Records & Reports</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          color: #333;
        }

        h2, h3, h4 {
          color: #e91e63;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 20px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }

        th {
          background: #fce4ec;
        }

        @media print {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>${preview.innerHTML}</body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = function() {
    printWindow.focus();
    printWindow.print();
  };
});

