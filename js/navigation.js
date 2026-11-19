function showPage(pageId) {

  const pages = document.querySelectorAll(".page");

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const selectedPage = document.getElementById(pageId);

  if (!selectedPage) return;

  selectedPage.classList.add("active");

  // Load Health Reports when the page is opened
if (pageId === "reports") {

  const cycleBox =
    document.getElementById("cycleReportSummary");

  if (cycleBox) {
    cycleBox.textContent = "Navigation reached Reports page.";
  }

  if (typeof PeriodWiseHealthReports !== "undefined") {

    if (cycleBox) {
      cycleBox.textContent = "Health Reports module found. Loading...";
    }

    PeriodWiseHealthReports.renderSummaries();

  } else {

    if (cycleBox) {
      cycleBox.textContent = "Health Reports module NOT found.";

    }

  }

}

  document.querySelectorAll(".nav-item").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.page === pageId
    );

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  try {
    history.replaceState(null, "", "#" + pageId);
  } catch (error) {
    console.warn("Navigation history unavailable.");
  }
}


document.addEventListener("click", function(event) {

  const button = event.target.closest("[data-page]");

  if (!button) return;

  showPage(button.dataset.page);

});
