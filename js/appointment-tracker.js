
// ==========================================
// PERIODWISE MEDICAL APPOINTMENT TRACKER
// ==========================================

window.PeriodWiseAppointments = {

  currentUserId: null,
  eventsBound: false,

  async init() {
    const section =
      document.getElementById("appointmentsSection");

    const form =
      document.getElementById("appointmentForm");

    const status =
      document.getElementById("appointmentAccessStatus");

    if (!section || !form || !status) return;

    try {
      const access =
        await PeriodWiseEntitlements.checkTtcHubAccess();

      if (!access.hasAccess) {
        section.style.display = "none";
        return;
      }

      const { data, error } =
        await window.periodWiseSupabase.auth.getSession();

      if (error) throw error;

      if (!data.session) {
        section.style.display = "none";
        return;
      }

      this.currentUserId = data.session.user.id;

      section.style.display = "block";

      status.textContent =
        "Your private appointment records are ready.";

      const dateInput =
        document.getElementById("appointmentDate");

      dateInput.value =
        new Date().toLocaleDateString("en-CA");

      dateInput.min = "1900-01-01";

      this.bindEvents();

      await this.loadAppointments();

    } catch (error) {
      console.error(
        "Appointment initialization error:",
        error
      );

      section.style.display = "none";
    }
  },

  bindEvents() {
    if (this.eventsBound) return;

    document.getElementById("appointmentForm")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        await this.saveAppointment();
      });

    document.getElementById("appointmentCancelEdit")
      .addEventListener("click", () => {
        this.resetForm();
      });

    this.eventsBound = true;
  },

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
      throw new Error(
        "Please sign in again to continue."
      );
    }
  },

  async saveAppointment() {
    const message =
      document.getElementById("appointmentMessage");

    const button =
      document.getElementById("appointmentSaveButton");

    try {
      await this.verifyAccess();

      const entryId =
        document.getElementById("appointmentEntryId").value;

      const appointment = {
        date:
          document.getElementById("appointmentDate").value,

        time:
          document.getElementById("appointmentTime").value,

        professional:
          document.getElementById("appointmentProfessional")
            .value.trim(),

        type:
          document.getElementById("appointmentType").value,

        questions:
          document.getElementById("appointmentQuestions")
            .value.trim(),

        notes:
          document.getElementById("appointmentNotes")
            .value.trim(),

        followUp:
          document.getElementById("appointmentFollowUp")
            .value.trim(),

        userId: this.currentUserId,

        updatedAt: new Date().toISOString()
      };

      if (!appointment.date || !appointment.type) {
        throw new Error(
          "Please enter the appointment date and type."
        );
      }

      if (entryId) {
        const existing = await PeriodWiseDB.get(
          "appointments",
          Number(entryId)
        );

        if (!existing ||
            existing.userId !== this.currentUserId) {
          throw new Error(
            "Appointment record could not be found."
          );
        }

        appointment.id = Number(entryId);
        appointment.createdAt = existing.createdAt;

      } else {
        appointment.createdAt =
          new Date().toISOString();
      }

      button.disabled = true;
      button.textContent = "Saving...";

      await PeriodWiseDB.save(
        "appointments",
        appointment
      );

      message.textContent = entryId
        ? "Appointment record updated."
        : "Appointment saved successfully.";

      this.resetForm();

      await this.loadAppointments();

    } catch (error) {
      console.error(
        "Appointment saving error:",
        error
      );

      message.textContent =
        error.message || "Unable to save appointment.";

    } finally {
      button.disabled = false;
      button.textContent = "Save Appointment";
    }
  },

  async loadAppointments() {
    await this.verifyAccess();

    const container =
      document.getElementById("appointmentHistory");

    const records =
      await PeriodWiseDB.getAll("appointments");

    const appointments = records
      .filter(record =>
        record.userId === this.currentUserId
      )
      .sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );

    container.replaceChildren();

    if (appointments.length === 0) {
      const empty = document.createElement("p");

      empty.className = "muted";

      empty.textContent =
        "You haven't saved any appointments yet.";

      container.appendChild(empty);

      return;
    }

    appointments.forEach(appointment => {
      const card = document.createElement("div");

      card.className = "history-item appointment-entry";

      const heading = document.createElement("h4");

      heading.textContent = appointment.type;

      const meta = document.createElement("p");

      meta.className = "muted";

      meta.textContent =
        appointment.date +
        (appointment.time
          ? " · " + appointment.time
          : "");

      const details = document.createElement("div");

      const fields = [
        ["Healthcare professional", appointment.professional],
        ["Questions", appointment.questions],
        ["Appointment notes", appointment.notes],
        ["Follow-up plan", appointment.followUp]
      ];

      fields.forEach(([label, value]) => {
        if (!value) return;

        const paragraph =
          document.createElement("p");

        const strong =
          document.createElement("strong");

        strong.textContent = label + ": ";

        paragraph.appendChild(strong);

        paragraph.appendChild(
          document.createTextNode(value)
        );

        details.appendChild(paragraph);
      });

      const actions = document.createElement("div");

      actions.className = "appointment-actions";

      const editButton =
        document.createElement("button");

      editButton.type = "button";
      editButton.className = "secondary-button";
      editButton.textContent = "Edit";

      editButton.addEventListener("click", () => {
        this.editAppointment(appointment);
      });

      const deleteButton =
        document.createElement("button");

      deleteButton.type = "button";
      deleteButton.className = "secondary-button";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", () => {
        this.deleteAppointment(appointment.id);
      });

      actions.append(editButton, deleteButton);

      card.append(
        heading,
        meta,
        details,
        actions
      );

      container.appendChild(card);
    });
  },

  editAppointment(appointment) {
    document.getElementById("appointmentEntryId").value =
      appointment.id;

    document.getElementById("appointmentDate").value =
      appointment.date;

    document.getElementById("appointmentTime").value =
      appointment.time || "";

    document.getElementById("appointmentProfessional").value =
      appointment.professional || "";

    document.getElementById("appointmentType").value =
      appointment.type;

    document.getElementById("appointmentQuestions").value =
      appointment.questions || "";

    document.getElementById("appointmentNotes").value =
      appointment.notes || "";

    document.getElementById("appointmentFollowUp").value =
      appointment.followUp || "";

    document.getElementById("appointmentSaveButton")
      .textContent = "Update Appointment";

    document.getElementById("appointmentCancelEdit").hidden =
      false;

    document.getElementById("appointmentMessage")
      .textContent = "Editing appointment record.";

    document.getElementById("appointmentForm")
      .scrollIntoView({ behavior: "smooth" });
  },

  async deleteAppointment(id) {
    if (!confirm(
      "Are you sure you want to delete this appointment?"
    )) {
      return;
    }

    try {
      await this.verifyAccess();

      const appointment = await PeriodWiseDB.get(
        "appointments",
        Number(id)
      );

      if (!appointment ||
          appointment.userId !== this.currentUserId) {
        throw new Error(
          "Appointment record could not be found."
        );
      }

      await PeriodWiseDB.delete(
        "appointments",
        Number(id)
      );

      document.getElementById("appointmentMessage")
        .textContent = "Appointment deleted.";

      await this.loadAppointments();

    } catch (error) {
      console.error(
        "Appointment deletion error:",
        error
      );

      document.getElementById("appointmentMessage")
        .textContent =
          error.message || "Unable to delete appointment.";
    }
  },

  resetForm() {
    const form =
      document.getElementById("appointmentForm");

    form.reset();

    document.getElementById("appointmentEntryId").value =
      "";

    document.getElementById("appointmentDate").value =
      new Date().toLocaleDateString("en-CA");

    document.getElementById("appointmentSaveButton")
      .textContent = "Save Appointment";

    document.getElementById("appointmentCancelEdit").hidden =
      true;

    document.getElementById("appointmentMessage")
      .textContent = "";
  }

};

console.log(
  "PeriodWise Medical Appointment Tracker loaded."
);
