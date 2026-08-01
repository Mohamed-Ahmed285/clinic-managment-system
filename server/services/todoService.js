const todoModel = require("../models/todo");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// Turns "2 weeks" / "5 days" into a plain number of days.
const toDurationDays = (durationValue, durationUnit) => {
    const value = Number(durationValue) > 0 ? Number(durationValue) : 1;
    return durationUnit === "weeks" ? value * 7 : value;
};

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

// Expands a single prescribed medication into one schedule entry per
// (day, time) pair, e.g. "Twice Daily for 7 days" -> 14 entries, so the
// patient's todo actually reflects every day they should take it, not
// just the two times of day.
const buildItemFromMedication = (medication, startDate) => {
    const durationDays = toDurationDays(medication.durationValue, medication.durationUnit);
    const times = medication.times && medication.times.length > 0 ? medication.times : [];

    const schedule = [];
    for (let dayOffset = 0; dayOffset < durationDays; dayOffset++) {
        const date = new Date(startDate.getTime() + dayOffset * DAY_IN_MS);
        times.forEach((time) => {
            schedule.push({
                date,
                time,
                completed: false,
                completedAt: null,
                reminderSent: false
            });
        });
    }

    return {
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        notes: medication.notes,
        startDate,
        durationDays,
        schedule
    };
};

const createFromPrescription = async (prescription) => {
    if (!prescription) {
        throw new Error("Prescription not found.");
    }

    // Prevent duplicate todos
    const existingTodo = await todoModel.findOne({
        appointmentId: prescription.appointmentId
    });

    if (existingTodo) {
        throw new Error("Todo already exists for this appointment.");
    }

    // The patient starts taking medication from the day the todo is
    // created (i.e. when the appointment is completed), not the day the
    // prescription was originally written.
    const startDate = startOfDay(new Date());

    const items = prescription.medications.map((medication) =>
        buildItemFromMedication(medication, startDate)
    );

    const todo = await todoModel.create({
        patientId: prescription.patientId,
        doctorId: prescription.doctorId,
        appointmentId: prescription.appointmentId,
        prescriptionId: prescription._id,
        items
    });

    return todo;
};

module.exports = {
    createFromPrescription
};