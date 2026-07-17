const todoModel = require("../models/todo");

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

    const items = prescription.medications.map((medication) => ({
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        notes: medication.notes,

        schedule: medication.times.map((time) => ({
            time,
            completed: false,
            completedAt: null
        }))
    }));

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