document.addEventListener("DOMContentLoaded", async function() {

  try {

    await PeriodWiseDB.open();

    console.log("PeriodWise database ready.");

  } catch (error) {

    console.error("Database initialization failed:", error);

    alert(
      "PeriodWise could not initialize its local database. " +
      "Please try again using an updated browser."
    );

  }


  const initialPage =
    window.location.hash.replace("#", "") || "dashboard";

  showPage(initialPage);


  const privacyButton =
    document.getElementById("privacyButton");

  privacyButton.addEventListener("click", function() {

    showPage("privacy");

  });


  if ("serviceWorker" in navigator) {

    window.addEventListener("load", function() {

      navigator.serviceWorker.register("./service-worker.js")
        .catch(error => {
          console.error("Offline setup failed:", error);
        });

    });

  }

});
