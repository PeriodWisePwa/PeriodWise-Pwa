
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

};


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


