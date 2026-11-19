
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
  }

};
