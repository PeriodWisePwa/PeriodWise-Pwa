
const PeriodWiseFertility = {

  // Save basal body temperature
  async saveBBT(date, temperature, unit, notes = "") {

    if (!date || temperature === "") {
      throw new Error("Enter the date and temperature.");
    }

    const value = Number(temperature);

    if (!Number.isFinite(value)) {
      throw new Error("Enter a valid temperature.");
    }

    if (unit === "C" && (value < 30 || value > 45)) {
      throw new Error("Check your Celsius temperature.");
    }

    if (unit === "F" && (value < 86 || value > 113)) {
      throw new Error("Check your Fahrenheit temperature.");
    }

    const record = {
      date,
      temperature: value,
      unit,
      notes,
      createdAt: new Date().toISOString()
    };

    return await PeriodWiseDB.save("bbtRecords", record);
  },


  // Save LH ovulation test
  async saveLH(date, result, notes = "") {

    const allowedResults = [
      "negative",
      "low",
      "high",
      "positive"
    ];

    if (!date || !allowedResults.includes(result)) {
      throw new Error("Enter a valid LH test result.");
    }

    const record = {
      date,
      result,
      notes,
      createdAt: new Date().toISOString()
    };

    return await PeriodWiseDB.save("lhRecords", record);
  },


  // Save pregnancy test
  async savePregnancyTest(date, result, notes = "") {

    const allowedResults = [
      "positive",
      "negative",
      "invalid"
    ];

    if (!date || !allowedResults.includes(result)) {
      throw new Error("Enter a valid pregnancy test result.");
    }

    const record = {
      date,
      result,
      notes,
      createdAt: new Date().toISOString()
    };

    return await PeriodWiseDB.save("pregnancyTests", record);
  },


  // Save cervical mucus observation
  async saveMucus(date, observation, notes = "") {

    const allowedObservations = [
      "dry",
      "sticky",
      "creamy",
      "watery",
      "egg-white"
    ];

    if (!date || !allowedObservations.includes(observation)) {
      throw new Error("Select a valid observation.");
    }

    const record = {
      date,
      category: "cervical-mucus",
      observation,
      notes,
      createdAt: new Date().toISOString()
    };

    return await PeriodWiseDB.save("symptomRecords", record);
  },


  // Save possible ovulation observations
  async saveOvulation(date, observation, notes = "") {

    if (!date || !observation.trim()) {
      throw new Error("Enter your observation.");
    }

    const record = {
      date,
      category: "ovulation",
      observation: observation.trim(),
      notes,
      createdAt: new Date().toISOString()
    };

    return await PeriodWiseDB.save("symptomRecords", record);
  },


  // Retrieve BBT records
  async getBBT() {

    const records = await PeriodWiseDB.getAll("bbtRecords");

    return records.sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  },


  // Retrieve LH records
  async getLH() {

    const records = await PeriodWiseDB.getAll("lhRecords");

    return records.sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  },


  // Retrieve pregnancy test records
  async getPregnancyTests() {

    const records =
      await PeriodWiseDB.getAll("pregnancyTests");

    return records.sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  },


  // Retrieve fertility observations
  async getObservations() {

    const records = await PeriodWiseDB.getAll("symptomRecords");

    return records
      .filter(record =>
        record.category === "cervical-mucus" ||
        record.category === "ovulation"
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  },


  // Delete a fertility record
  async deleteRecord(storeName, id) {

    const allowedStores = [
      "bbtRecords",
      "lhRecords",
      "symptomRecords",
      "pregnancyTests"
    ];

    if (!allowedStores.includes(storeName)) {
      throw new Error("Invalid record category.");
    }

    return await PeriodWiseDB.delete(storeName, id);
  }

};
