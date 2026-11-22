
// ==========================================
// PERIODWISE TTC JOURNAL
// ==========================================

window.PeriodWiseTtcJournal = {

  currentUserId: null,

  // Verify access and initialize journal
  async init() {

    const form = document.getElementById("ttcJournalForm");
    const status = document.getElementById("ttcJournalAccessStatus");
    const dateInput = document.getElementById("ttcJournalDate");

    if (!form || !status) return;

    try {

      const access =
        await PeriodWiseEntitlements.checkTtcHubAccess();

      if (!access.hasAccess) {

        form.hidden = true;

        status.textContent = access.message;

        document.getElementById("ttcJournalHistory").textContent =
          "TTC Hub access is required to use your journal.";

        return;
      }

      const { data, error } =
        await window.periodWiseSupabase.auth.getSession();

      if (error) throw error;

      if (!data.session) {

        form.hidden = true;
        status.textContent = "Please sign in to use your journal.";

        return;
      }

      this.currentUserId = data.session.user.id;

      status.textContent =
        "Your private TTC Journal is ready.";

      document.getElementById("ttcJournalSection").style.display = "block";

      if (dateInput) {
        dateInput.value =
          new Date().toLocaleDateString("en-CA");
        dateInput.max = dateInput.value;
      }

      this.bindEvents();

      await this.loadEntries();

    } catch (error) {

      console.error("TTC Journal initialization error:", error);

      form.hidden = true;

      status.textContent =
        "Unable to load your journal. Please try again.";

    }

  },

  // Connect journal form events
  bindEvents() {

    if (this.eventsBound) return;

    const form = document.getElementById("ttcJournalForm");

    form.addEventListener("submit", async (event) => {

      event.preventDefault();

      await this.saveEntry();

    });

    document.getElementById("ttcJournalCancelEdit")
      .addEventListener("click", () => {

        this.resetForm();

      });

    this.eventsBound = true;

  },

  eventsBound: false,

  // Verify access before every journal operation
  async verifyAccess() {

    const access =
      await PeriodWiseEntitlements.checkTtcHubAccess();

    if (!access.hasAccess) {
      throw new Error(
        access.message || "TTC Hub access is required."
      );
    }

    const { data, error } =
      await window.periodWiseSupabase.auth.getSession();

    if (error) throw error;

    if (!data.session ||
        data.session.user.id !== this.currentUserId) {

      throw new Error("Please sign in again to continue.");

    }

  },

  // Save a new entry or update an existing entry
  async saveEntry() {

    const message =
      document.getElementById("ttcJournalMessage");

    const button =
      document.getElementById("ttcJournalSaveButton");

    try {

      await this.verifyAccess();

      const entryId =
        document.getElementById("ttcJournalEntryId").value;

      const entry = {

        date: document.getElementById("ttcJournalDate").value,

        title: document.getElementById("ttcJournalTitle")
          .value.trim(),

        category:
          document.getElementById("ttcJournalCategory").value,

        content:
          document.getElementById("ttcJournalContent")
            .value.trim(),

        userId: this.currentUserId,

        updatedAt: new Date().toISOString()

      };

      if (!entry.date || !entry.title || !entry.category ||
          !entry.content) {

        throw new Error("Please complete all journal fields.");

      }

      if (entryId) {

        const existing = await PeriodWiseDB.get(
          "ttcNotes",
          Number(entryId)
        );

        if (!existing || existing.userId !== this.currentUserId) {
          throw new Error("Journal entry could not be found.");
        }

        entry.id = Number(entryId);
        entry.createdAt = existing.createdAt;

      } else {

        entry.createdAt = new Date().toISOString();

      }

      button.disabled = true;

      button.textContent = "Saving...";

      await PeriodWiseDB.save("ttcNotes", entry);

      message.textContent = entryId
        ? "Your journal entry has been updated."
        : "Your journal entry has been saved.";

      this.resetForm();

      await this.loadEntries();

    } catch (error) {

      console.error("TTC Journal saving error:", error);

      message.textContent =
        error.message || "Unable to save journal entry.";

    } finally {

      button.disabled = false;

      button.textContent = "Save Journal Entry";

    }

  },

  // Retrieve journal entries for the TTC Health Report
async getReportEntries() {

  await this.verifyAccess();

  const records =
    await PeriodWiseDB.getAll("ttcNotes");

  return records
    .filter(record => record.userId === this.currentUserId)
    .sort((a, b) =>
      new Date(b.date) - new Date(a.date)
    );

},

  // Retrieve and display journal entries
  async loadEntries() {

    await this.verifyAccess();

    const container =
      document.getElementById("ttcJournalHistory");

    const records =
      await PeriodWiseDB.getAll("ttcNotes");

    const entries = records
      .filter(record => record.userId === this.currentUserId)
      .sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

    container.replaceChildren();

    if (entries.length === 0) {

      const empty = document.createElement("p");

      empty.className = "muted";

      empty.textContent =
        "You haven't created any journal entries yet.";

      container.appendChild(empty);

      return;

    }

    entries.forEach(entry => {

      const card = document.createElement("div");

      card.className = "history-item ttc-journal-entry";

      const heading = document.createElement("h4");
      heading.textContent = entry.title;

      const meta = document.createElement("p");
      meta.className = "muted";

      meta.textContent =
        entry.date + " · " + entry.category;

      const content = document.createElement("p");
      content.className = "ttc-journal-content";
      content.textContent = entry.content;

      const actions = document.createElement("div");
      actions.className = "ttc-journal-actions";

      const editButton = document.createElement("button");

      editButton.type = "button";
      editButton.className = "secondary-button";
      editButton.textContent = "Edit";

      editButton.addEventListener("click", () => {
        this.editEntry(entry);
      });

      const deleteButton = document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className = "secondary-button";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () => {
        this.deleteEntry(entry.id);
      });

      actions.append(editButton, deleteButton);

      card.append(heading, meta, content, actions);

      container.appendChild(card);

    });

  },

  // Load an entry into the form for editing
  editEntry(entry) {

    document.getElementById("ttcJournalEntryId").value =
      entry.id;

    document.getElementById("ttcJournalDate").value =
      entry.date;

    document.getElementById("ttcJournalTitle").value =
      entry.title;

    document.getElementById("ttcJournalCategory").value =
      entry.category;

    document.getElementById("ttcJournalContent").value =
      entry.content;

    document.getElementById("ttcJournalSaveButton").textContent =
      "Update Journal Entry";

    document.getElementById("ttcJournalCancelEdit").hidden =
      false;

    document.getElementById("ttcJournalMessage").textContent =
      "Editing your journal entry.";

    document.getElementById("ttcJournalForm")
      .scrollIntoView({ behavior: "smooth" });

  },

  // Delete an entry
  async deleteEntry(id) {

    if (!confirm("Are you sure you want to delete this journal entry?")) {
      return;
    }

    try {

      await this.verifyAccess();

      const entry =
        await PeriodWiseDB.get("ttcNotes", Number(id));

      if (!entry || entry.userId !== this.currentUserId) {
        throw new Error("Journal entry could not be found.");
      }

      await PeriodWiseDB.delete("ttcNotes", Number(id));

      document.getElementById("ttcJournalMessage").textContent =
        "Journal entry deleted.";

      await this.loadEntries();

    } catch (error) {

      console.error("TTC Journal deletion error:", error);

      document.getElementById("ttcJournalMessage").textContent =
        error.message || "Unable to delete journal entry.";

    }

  },

  // Reset the journal form
  resetForm() {

    const form = document.getElementById("ttcJournalForm");

    form.reset();

    document.getElementById("ttcJournalEntryId").value = "";

    document.getElementById("ttcJournalDate").value =
      new Date().toLocaleDateString("en-CA");

    document.getElementById("ttcJournalSaveButton").textContent =
      "Save Journal Entry";

    document.getElementById("ttcJournalCancelEdit").hidden =
      true;

  }

};

console.log("PeriodWise TTC Journal module loaded.");
