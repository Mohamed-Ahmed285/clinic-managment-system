const prescriptionModel = require("../models/prescription");
const appointmentModel = require("../models/appointment");
const doctorModel = require("../models/doctor");
const {
    resolveAppointmentForDoctor,
    canAccessPatientClinicalData
} = require("../utils/appointmentHelpers");
const populatePrescription = [
    { path: "patientId", populate: { path: "_id", select: "name email phone profileImage" } },
    { path: "doctorId", populate: [{ path: "_id", select: "name email phone profileImage" }, { path: "specialtyId" }] },
    { path: "appointmentId" }
];
const createPrescription = async (req, res) => {
    try {
        const { appointmentId, medications, generalNotes, issuedDate } = req.body;
        if (!appointmentId) {
            return res.status(400).send("appointmentId is required");
        }
        const context = await resolveAppointmentForDoctor(req, appointmentId);
        if (context.error) {
            return res.status(context.error.status).send(context.error.message);
        }
        if (context.appointment.status === "completed") {
            return res.status(400).send("cannot add prescription to a completed appointment");
        }
        const existing = await prescriptionModel.findOne({ appointmentId });
        if (existing) {
            return res.status(400).send("prescription already exists for this appointment");
        }
        const prescription = await prescriptionModel.create({
            patientId: context.patientId,
            doctorId: context.doctorId,
            appointmentId,
            medications,
            generalNotes,
            issuedDate
        });
        await prescription.populate(populatePrescription);
        return res.status(201).json(prescription);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const getPrescriptions = async (req, res) => {
    try {
        const prescriptions = await prescriptionModel.find().populate(populatePrescription);
        return res.status(200).json(prescriptions);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const getPrescriptionsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const allowed = await canAccessPatientClinicalData(req, patientId);
        if (!allowed) {
            return res.status(403).send("access denied");
        }
        const prescriptions = await prescriptionModel
            .find({ patientId })
            .sort({ issuedDate: -1 })
            .populate(populatePrescription);
        return res.status(200).json(prescriptions);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const getPrescriptionByAppointment = async (req, res) => {
    try {
        const context = await resolveAppointmentForDoctor(req, req.params.appointmentId);
        if (context.error) {
            return res.status(context.error.status).send(context.error.message);
        }
        const prescription = await prescriptionModel
            .findOne({ appointmentId: req.params.appointmentId })
            .populate(populatePrescription);
        if (!prescription) {
            return res.status(404).send("prescription not found");
        }
        return res.status(200).json(prescription);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

const getPrescriptionById = async (req, res) => {
    try {
        const prescription = await prescriptionModel.findById(req.params.id).populate(populatePrescription);
        if (!prescription) {
            return res.status(404).send("prescription not found");
        }
        const allowed = await canAccessPatientClinicalData(req, prescription.patientId);
        if (!allowed) {
            return res.status(403).send("access denied");
        }
        return res.status(200).json(prescription);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const updatePrescription = async (req, res) => {
    try {
        const prescription = await prescriptionModel.findById(req.params.id);
        if (!prescription) {
            return res.status(404).send("prescription not found");
        }
        if (req.user.role !== "admin") {
            const doctor = await doctorModel.findOne(req.user.id);
            if (!doctor || prescription.doctorId.toString() !== doctor._id.toString()) {
                return res.status(403).send("access denied");
            }
        }
        const appointment = await appointmentModel.findById(prescription.appointmentId);
        if (appointment && appointment.status === "completed") {
            return res.status(400).send("cannot update prescription for a completed appointment");
        }
        const updated = await prescriptionModel.findByIdAndUpdate(
            req.params.id,
            {
                medications: req.body.medications,
                generalNotes: req.body.generalNotes,
                issuedDate: req.body.issuedDate
            },
            { new: true, runValidators: true }
        ).populate(populatePrescription);
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const deletePrescription = async (req, res) => {
    try {
        const prescription = await prescriptionModel.findById(req.params.id);
        if (!prescription) {
            return res.status(404).send("prescription not found");
        }
        const appointment = await appointmentModel.findById(prescription.appointmentId);
        if (appointment && appointment.status === "completed") {
            return res.status(400).send("cannot delete prescription for a completed appointment");
        }
        await prescriptionModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "prescription deleted" });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
module.exports = {
    createPrescription,
    getPrescriptions,
    getPrescriptionsByPatient,
    getPrescriptionByAppointment,
    getPrescriptionById,
    updatePrescription,
    deletePrescription
};