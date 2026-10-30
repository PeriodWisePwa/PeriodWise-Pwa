const PeriodWiseCycle = {

async savePeriod(date, periodLength, cycleLength) {

if (!date || !periodLength || !cycleLength) {
  throw new Error("Please complete all cycle information.");
}

const startDate = new Date(date + "T12:00:00");

if (isNaN(startDate.getTime())) {
  throw new Error("Please enter a valid period date.");
}

if (startDate > new Date()) {
  throw new Error("Period start date cannot be in the future.");
}

if (periodLength < 1 || periodLength > 10) {
  throw new Error("Period duration must be between 1 and 10 days.");
}

if (cycleLength < 15 || cycleLength > 60) {
  throw new Error("Cycle length must be between 15 and 60 days.");
}

const record = {
  startDate: date,
  periodLength: Number(periodLength),
  cycleLength: Number(cycleLength),
  createdAt: new Date().toISOString()
};

return await PeriodWiseDB.save("cycleRecords", record);

},

async getHistory() {

const records = await PeriodWiseDB.getAll("cycleRecords");

return records.sort((a, b) =>
  new Date(b.startDate) - new Date(a.startDate)
);

},

async deletePeriod(id) {

return await PeriodWiseDB.delete("cycleRecords", id);

},

calculatePredictions(record) {

if (!record) return null;

const start = new Date(record.startDate + "T12:00:00");

const nextPeriod = new Date(start);

nextPeriod.setDate(
  nextPeriod.getDate() + Number(record.cycleLength)
);

const ovulation = new Date(nextPeriod);

ovulation.setDate(ovulation.getDate() - 14);

const fertileStart = new Date(ovulation);
fertileStart.setDate(fertileStart.getDate() - 5);

const fertileEnd = new Date(ovulation);
fertileEnd.setDate(fertileEnd.getDate() + 1);

return {
  nextPeriod,
  ovulation,
  fertileStart,
  fertileEnd
};

},

formatDate(date) {

return date.toLocaleDateString(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric"
});

}

};
