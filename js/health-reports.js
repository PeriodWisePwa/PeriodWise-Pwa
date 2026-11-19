
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
