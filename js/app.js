document.addEventListener("DOMContentLoaded", async function () {

// Initialize the local database
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

// Navigation
const initialPage =
window.location.hash.replace("#", "") || "dashboard";

showPage(initialPage);

const privacyButton = document.getElementById("privacyButton");

if (privacyButton) {
privacyButton.addEventListener("click", function () {
showPage("privacy");
});
}

// Cycle Tracker elements
const cycleForm = document.getElementById("cycleForm");
const periodStart = document.getElementById("periodStart");
const periodDuration = document.getElementById("periodDuration");
const cycleLength = document.getElementById("cycleLength");
const cycleMessage = document.getElementById("cycleMessage");

// Prevent future dates
if (periodStart) {
periodStart.max = new Date().toLocaleDateString("en-CA");
}

// Save period information
if (cycleForm) {

cycleForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  cycleMessage.textContent = "Saving your period...";

  try {

    await PeriodWiseCycle.savePeriod(
      periodStart.value,
      Number(periodDuration.value),
      Number(cycleLength.value)
    );

    cycleMessage.textContent =
      "Your period record has been saved successfully.";

    await loadCycleHistory();

    cycleForm.reset();

    periodDuration.value = 5;
    cycleLength.value = 28;

  } catch (error) {

    console.error("Cycle saving error:", error);

    cycleMessage.textContent =
      error.message || "Unable to save your period. Please try again.";

  }

});

}

// Load saved cycle history
async function loadCycleHistory() {

const historyContainer =
  document.getElementById("cycleHistory");

if (!historyContainer) return;

try {

  const records = await PeriodWiseCycle.getHistory();

  historyContainer.innerHTML = "";

  if (records.length === 0) {

    historyContainer.innerHTML =
      '<p class="muted">Your saved periods will appear here.</p>';

    updateCycleOverview(null);

    return;
  }

  records.forEach(function (record) {

    const item = document.createElement("div");
    item.className = "history-item";

    const date = document.createElement("strong");
    date.textContent =
      PeriodWiseCycle.formatDate(
        new Date(record.startDate + "T12:00:00")
      );

    const details = document.createElement("p");
    details.textContent =
      record.periodLength + " period days · " +
      record.cycleLength + " cycle days";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "secondary-button";

    deleteButton.addEventListener("click", async function () {

      const confirmed = window.confirm(
        "Are you sure you want to delete this period record?"
      );

      if (!confirmed) return;

      try {
        await PeriodWiseCycle.deletePeriod(record.id);
        await loadCycleHistory();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Unable to delete this record. Please try again.");
      }

    });

    item.appendChild(date);
    item.appendChild(details);
    item.appendChild(deleteButton);

    historyContainer.appendChild(item);

  });

  updateCycleOverview(records[0]);

} catch (error) {

  console.error("History loading error:", error);

  historyContainer.textContent =
    "Unable to load your cycle history.";

}

}

// Update cycle estimates
function updateCycleOverview(record) {

const nextPeriodDisplay =
  document.getElementById("nextPeriodDisplay");

const fertileWindowDisplay =
  document.getElementById("fertileWindowDisplay");

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

// Load records when app opens
await loadCycleHistory();

// Register service worker
if ("serviceWorker" in navigator) {

window.addEventListener("load", function () {

  navigator.serviceWorker.register("./service-worker.js")
    .then(function (registration) {
      console.log("PeriodWise offline service registered.");
    })
    .catch(function (error) {
      console.error("Offline setup failed:", error);
    });

});

}

});
