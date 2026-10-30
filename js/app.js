document.addEventListener("DOMContentLoaded", async function () {

// 1. Initialize the PeriodWise database
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

// 2. Open the correct page when the app loads
const initialPage =
window.location.hash.replace("#", "") || "dashboard";

showPage(initialPage);

// 3. Privacy Centre navigation
const privacyButton = document.getElementById("privacyButton");

if (privacyButton) {
privacyButton.addEventListener("click", function () {
showPage("privacy");
});
}

// 4. Register the service worker for offline functionality
if ("serviceWorker" in navigator) {

window.addEventListener("load", function () {

  navigator.serviceWorker.register("./service-worker.js")
    .then(function (registration) {
      console.log(
        "PeriodWise offline service registered:",
        registration.scope
      );
    })
    .catch(function (error) {
      console.error("Offline setup failed:", error);
    });

});

}

});
