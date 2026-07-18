const medicalRecordModel = require("../models/medicalRecord");
const doctorModel = require("../models/doctor");
const {
    resolveAppointmentForDoctor,
    canAccessPatientClinicalData
} = require("../utils/appointmentHelpers");
const populateMedicalRecord = [
    { path: "patientId", populate: { path: "_id", select: "name email phone profileImage" } },
    { path: "doctorId", populate: [{ path: "_id", select: "name email phone profileImage" }, { path: "specialtyId" }] },
    { path: "appointmentId" }
];
const createMedicalRecord = async (req, res) => {
    try {
        const { appointmentId, diagnosis, symptoms, notes, attachments, visitDate } = req.body;
        if (!appointmentId) {
            return res.status(400).send("appointmentId is required");
        }
        const context = await resolveAppointmentForDoctor(req, appointmentId);
        if (context.error) {
            return res.status(context.error.status).send(context.error.message);
        }
        const record = await medicalRecordModel.create({
            patientId: context.patientId,
            doctorId: context.doctorId,
            appointmentId,
            diagnosis,
            symptoms,
            notes,
            attachments,
            visitDate
        });
        await record.populate(populateMedicalRecord);
        return res.status(201).json(record);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const getMedicalRecords = async (req, res) => {
    try {
        const records = await medicalRecordModel.find().populate(populateMedicalRecord);
        return res.status(200).json(records);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const getMedicalRecordsByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const allowed = await canAccessPatientClinicalData(req, patientId);
        if (!allowed) {
            return res.status(403).send("access denied");
        }
        const records = await medicalRecordModel
            .find({ patientId })
            .sort({ visitDate: -1 })
            .populate(populateMedicalRecord);
        return res.status(200).json(records);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const getMedicalRecordsByAppointment = async (req, res) => {
    try {
        const context = await resolveAppointmentForDoctor(req, req.params.appointmentId);
        if (context.error) {
            return res.status(context.error.status).send(context.error.message);
        }
        const records = await medicalRecordModel
            .find({ appointmentId: req.params.appointmentId })
            .populate(populateMedicalRecord);
        return res.status(200).json(records);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const getMedicalRecordById = async (req, res) => {
    try {
        const record = await medicalRecordModel.findById(req.params.id).populate(populateMedicalRecord);
        if (!record) {
            return res.status(404).send("medical record not found");
        }
        const allowed = await canAccessPatientClinicalData(req, record.patientId);
        if (!allowed) {
            return res.status(403).send("access denied");
        }
        return res.status(200).json(record);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const updateMedicalRecord = async (req, res) => {
    try {
        const record = await medicalRecordModel.findById(req.params.id);
        if (!record) {
            return res.status(404).send("medical record not found");
        }
        if (req.user.role !== "admin") {
            const doctor = await doctorModel.findOne(req.user.id);
            if (!doctor || record.doctorId.toString() !== doctor._id.toString()) {
                return res.status(403).send("access denied");
            }
        }
        const updated = await medicalRecordModel.findByIdAndUpdate(
            req.params.id,
            {
                diagnosis: req.body.diagnosis,
                symptoms: req.body.symptoms,
                notes: req.body.notes,
                attachments: req.body.attachments,
                visitDate: req.body.visitDate
            },
            { new: true, runValidators: true }
        ).populate(populateMedicalRecord);
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const deleteMedicalRecord = async (req, res) => {
    try {
        const record = await medicalRecordModel.findByIdAndDelete(req.params.id);
        if (!record) {
            return res.status(404).send("medical record not found");
        }
        return res.status(200).json({ message: "medical record deleted" });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};
module.exports = {
    createMedicalRecord,
    getMedicalRecords,
    getMedicalRecordsByPatient,
    getMedicalRecordsByAppointment,
    getMedicalRecordById,
    updateMedicalRecord,
    deleteMedicalRecord
};