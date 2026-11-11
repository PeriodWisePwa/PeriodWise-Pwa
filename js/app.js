document.addEventListener("DOMContentLoaded", async function () {

// =====================================
// 1. INITIALIZE PERIODWISE DATABASE
// =====================================

try {
await PeriodWiseDB.open();
console.log("PeriodWise database ready.");

} catch (error) {

console.error("Database initialization failed:", error);

alert(
  "PeriodWise could not initialize its local database. " +
  "Please try again using an updated browser."
);

return;

}

// =====================================
// 2. NAVIGATION
// =====================================

const initialPage =
window.location.hash.replace("#", "") || "dashboard";

showPage(initialPage);

const privacyButton =
document.getElementById("privacyButton");

if (privacyButton) {
privacyButton.addEventListener("click", function () {
showPage("privacy");
});
}

// =====================================
// 3. COMMON HELPER FUNCTIONS
// =====================================

function setMessage(elementId, message) {

const element = document.getElementById(elementId);

if (element) {
  element.textContent = message;
}

}

function formatDate(dateString) {

const date = new Date(dateString + "T12:00:00");

return date.toLocaleDateString(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric"
});

}

function createHistoryEntry(container, title, details, storeName, id) {

const item = document.createElement("div");
item.className = "history-item";

const heading = document.createElement("strong");
heading.textContent = title;

const description = document.createElement("p");
description.textContent = details;

const deleteButton = document.createElement("button");

deleteButton.type = "button";
deleteButton.textContent = "Delete";
deleteButton.className = "secondary-button";

deleteButton.addEventListener("click", async function () {

  const confirmed = window.confirm(
    "Are you sure you want to delete this record?"
  );

  if (!confirmed) return;

  try {

    await PeriodWiseDB.delete(storeName, id);

    await loadCycleHistory();
    await loadFertilityHistory();

  } catch (error) {

    console.error("Record deletion failed:", error);

    alert("Unable to delete this record. Please try again.");

  }

});

item.appendChild(heading);
item.appendChild(description);
item.appendChild(deleteButton);

container.appendChild(item);

}

// =====================================
// 4. CYCLE TRACKER
// =====================================

const cycleForm =
document.getElementById("cycleForm");

const periodStart =
document.getElementById("periodStart");

const periodDuration =
document.getElementById("periodDuration");

const cycleLength =
document.getElementById("cycleLength");

if (periodStart) {
periodStart.max = new Date().toLocaleDateString("en-CA");
}

if (cycleForm) {

cycleForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  setMessage("cycleMessage", "Saving your period...");

  try {

    await PeriodWiseCycle.savePeriod(
      periodStart.value,
      Number(periodDuration.value),
      Number(cycleLength.value)
    );

    setMessage(
      "cycleMessage",
      "Your period record has been saved successfully."
    );

    cycleForm.reset();

    periodDuration.value = 5;
    cycleLength.value = 28;

    await loadCycleHistory();

  } catch (error) {

    console.error("Cycle saving error:", error);

    setMessage(
      "cycleMessage",
      error.message || "Unable to save your period."
    );

  }

});

}


async function loadCycleHistory() {
  const container = document.getElementById("cycleHistory");
  const accessMessage = document.getElementById("cycleHistoryAccessMessage");

  if (!container) return;

  try {
    const records = await PeriodWiseCycle.getHistory();

    container.innerHTML = "";

    if (records.length === 0) {
      container.textContent = "Your saved periods will appear here.";

      if (accessMessage) {
        accessMessage.textContent = "";
      }

      updateCycleOverview(null);
      return;
    }

    // Show only the latest 3 cycles in the free tracker.
    const visibleRecords = records.slice(0, 3);

    visibleRecords.forEach(function (record) {
      createHistoryEntry(
        container,
        formatDate(record.startDate),
        record.periodLength + " period days · " +
        record.cycleLength + " cycle days",
        "cycleRecords",
        record.id
      );
    });

    // Inform users when older records are available.
    const olderRecordsCount = records.length - visibleRecords.length;

    if (accessMessage) {
      if (olderRecordsCount > 0) {
        accessMessage.textContent =
          olderRecordsCount +
          " older cycle record(s) are saved. Subscribe to Cycle History Reports to access your complete history and download your report.";
      } else {
        accessMessage.textContent =
          "Your latest 3 cycles are displayed here.";
      }
    }

    updateCycleOverview(records[0]);

  } catch (error) {
    console.error("Cycle history error:", error);
    container.textContent = "Unable to load your period history.";
  }
}


function updateCycleOverview(record) {

const nextPeriodDisplay =
  document.getElementById("nextPeriodDisplay");

const fertileWindowDisplay =
  document.getElementById("fertileWindowDisplay");

if (!nextPeriodDisplay || !fertileWindowDisplay) return;

if (!record) {

  nextPeriodDisplay.textContent = "Not available";
  fertileWindowDisplay.textContent = "Not available";

  return;
}

const predictions =
  PeriodWiseCycle.calculatePredictions(record);

nextPeriodDisplay.textContent =
  PeriodWiseCycle.formatDate(predictions.nextPeriod);

fertileWindowDisplay.textContent =
  PeriodWiseCycle.formatDate(predictions.fertileStart) +
  " – " +
  PeriodWiseCycle.formatDate(predictions.fertileEnd);

}

// =====================================
// 5. BBT TRACKER
// =====================================

const bbtForm =
document.getElementById("bbtForm");

const bbtDate =
document.getElementById("bbtDate");

const bbtTemperature =
document.getElementById("bbtTemperature");

const bbtUnit =
document.getElementById("bbtUnit");

const bbtNotes =
document.getElementById("bbtNotes");

if (bbtDate) {
bbtDate.max = new Date().toLocaleDateString("en-CA");
}

if (bbtForm) {

bbtForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  setMessage("bbtMessage", "Saving temperature...");

  try {

    await PeriodWiseFertility.saveBBT(
      bbtDate.value,
      bbtTemperature.value,
      bbtUnit.value,
      bbtNotes.value
    );

    setMessage(
      "bbtMessage",
      "Your BBT reading has been saved."
    );

    bbtForm.reset();

    await loadBBTHistory();

  } catch (error) {

    console.error("BBT saving error:", error);

    setMessage(
      "bbtMessage",
      error.message || "Unable to save BBT reading."
    );

  }

});

}


async function loadBBTHistory() {

  const container =
    document.getElementById("bbtHistory");

  const accessMessage =
    document.getElementById("bbtHistoryAccessMessage");

  if (!container) return;

  try {

    const records =
      await PeriodWiseFertility.getBBT();

    container.innerHTML = "";

    if (records.length === 0) {

      container.textContent =
        "Your temperature records will appear here.";

      if (accessMessage) {
        accessMessage.textContent = "";
      }

      return;
    }

    // Show only the latest 7 BBT readings.
    const visibleRecords = records.slice(0, 7);

    visibleRecords.forEach(function (record) {

      createHistoryEntry(
        container,
        formatDate(record.date),
        record.temperature + " °" + record.unit +
        (record.notes ? " · " + record.notes : ""),
        "bbtRecords",
        record.id
      );

    });

    const olderRecordsCount =
      records.length - visibleRecords.length;

    if (accessMessage) {

      if (olderRecordsCount > 0) {

        accessMessage.textContent =
          olderRecordsCount +
          " older BBT record(s) are saved. Subscribe to Fertility Records & Reports to access and download your complete fertility history.";

      } else {

        accessMessage.textContent =
          "Your latest 7 BBT readings are displayed here.";

      }

    }

  } catch (error) {

    console.error("BBT history error:", error);

    container.textContent =
      "Unable to load BBT history.";

  }

}


// =====================================
// 6. LH OVULATION TEST TRACKER
// =====================================

const lhForm =
document.getElementById("lhForm");

const lhDate =
document.getElementById("lhDate");

const lhResult =
document.getElementById("lhResult");

const lhNotes =
document.getElementById("lhNotes");

if (lhDate) {
lhDate.max = new Date().toLocaleDateString("en-CA");
}

if (lhForm) {

lhForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  setMessage("lhMessage", "Saving LH result...");

  try {

    await PeriodWiseFertility.saveLH(
      lhDate.value,
      lhResult.value,
      lhNotes.value
    );

    setMessage(
      "lhMessage",
      "Your LH test result has been saved."
    );

    lhForm.reset();

    await loadLHHistory();

  } catch (error) {

    console.error("LH saving error:", error);

    setMessage(
      "lhMessage",
      error.message || "Unable to save LH result."
    );

  }

});

}


async function loadLHHistory() {

  const container =
    document.getElementById("lhHistory");

  const accessMessage =
    document.getElementById("lhHistoryAccessMessage");

  if (!container) return;

  try {

    const records =
      await PeriodWiseFertility.getLH();

    container.innerHTML = "";

    if (records.length === 0) {

      container.textContent =
        "Your LH test records will appear here.";

      if (accessMessage) {
        accessMessage.textContent = "";
      }

      return;
    }

    // Show only the latest 7 LH test records.
    const visibleRecords = records.slice(0, 7);

    visibleRecords.forEach(function (record) {

      createHistoryEntry(
        container,
        formatDate(record.date),
        "Test result: " + record.result +
        (record.notes ? " · " + record.notes : ""),
        "lhRecords",
        record.id
      );

    });

    const olderRecordsCount =
      records.length - visibleRecords.length;

    if (accessMessage) {

      if (olderRecordsCount > 0) {

        accessMessage.textContent =
          olderRecordsCount +
          " older LH test record(s) are saved. Subscribe to Fertility Records & Reports to access and download your complete fertility history.";

      } else {

        accessMessage.textContent =
          "Your latest 7 LH test records are displayed here.";

      }

    }

  } catch (error) {

    console.error("LH history error:", error);

    container.textContent =
      "Unable to load LH history.";

  }

}


// =====================================
// 7. CERVICAL MUCUS TRACKER
// =====================================

const mucusForm =
document.getElementById("mucusForm");

const mucusDate =
document.getElementById("mucusDate");

const mucusObservation =
document.getElementById("mucusObservation");

const mucusNotes =
document.getElementById("mucusNotes");

if (mucusDate) {
mucusDate.max = new Date().toLocaleDateString("en-CA");
}

if (mucusForm) {

mucusForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  setMessage(
    "mucusMessage",
    "Saving your observation..."
  );

  try {

    await PeriodWiseFertility.saveMucus(
      mucusDate.value,
      mucusObservation.value,
      mucusNotes.value
    );

    setMessage(
      "mucusMessage",
      "Your cervical mucus observation has been saved."
    );

    mucusForm.reset();

    await loadFertilityHistory();

  } catch (error) {

    console.error("Mucus saving error:", error);

    setMessage(
      "mucusMessage",
      error.message || "Unable to save observation."
    );

  }

});

}

// =====================================
// 8. OVULATION OBSERVATIONS
// =====================================

const ovulationForm =
document.getElementById("ovulationForm");

const ovulationDate =
document.getElementById("ovulationDate");

const ovulationObservation =
document.getElementById("ovulationObservation");

const ovulationNotes =
document.getElementById("ovulationNotes");

if (ovulationDate) {
ovulationDate.max = new Date().toLocaleDateString("en-CA");
}

if (ovulationForm) {

ovulationForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  setMessage(
    "ovulationMessage",
    "Saving your observation..."
  );

  try {

    await PeriodWiseFertility.saveOvulation(
      ovulationDate.value,
      ovulationObservation.value,
      ovulationNotes.value
    );

    setMessage(
      "ovulationMessage",
      "Your ovulation observation has been saved."
    );

    ovulationForm.reset();

    await loadFertilityHistory();

  } catch (error) {

    console.error("Ovulation saving error:", error);

    setMessage(
      "ovulationMessage",
      error.message || "Unable to save observation."
    );

  }

});

}

// =====================================
// 9. FERTILITY OBSERVATION HISTORY
// =====================================

async function loadFertilityHistory() {

const container =
  document.getElementById("fertilityHistory");

if (!container) return;

try {

  const records =
    await PeriodWiseFertility.getObservations();

  container.innerHTML = "";

  if (records.length === 0) {

    container.textContent =
      "Your fertility observations will appear here.";

    return;
  }

  records.forEach(function (record) {

    const title =
      record.category === "cervical-mucus"
        ? "Cervical mucus · " + record.observation
        : "Ovulation observation";

    const details =
      (record.notes || record.observation) || "";

    createHistoryEntry(
      container,
      formatDate(record.date) + " · " + title,
      details,
      "symptomRecords",
      record.id
    );

  });

} catch (error) {

  console.error("Fertility history error:", error);

  container.textContent =
    "Unable to load fertility history.";

}

}

// =====================================
// 10. LOAD SAVED INFORMATION
// =====================================

await loadCycleHistory();

await loadBBTHistory();

await loadLHHistory();

await loadFertilityHistory();

// =====================================
// 11. SERVICE WORKER
// =====================================

if ("serviceWorker" in navigator) {

window.addEventListener("load", function () {

  navigator.serviceWorker.register("./service-worker.js")
    .then(function () {
      console.log("PeriodWise offline service registered.");
    })
    .catch(function (error) {
      console.error("Offline setup failed:", error);
    });

});

}

});
