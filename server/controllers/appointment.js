const appointmentModel = require("../models/appointment");
const patientModel = require("../models/patient");
const doctorModel = require("../models/doctor");
const clinicModel = require("../models/clinic");
const prescriptionModel = require("../models/prescription");
const todoModel = require("../models/todo");
const todoService = require("../services/todoService");

const populateAppointment = [
    { path: "patientId", populate: { path: "_id", select: "name email phone profileImage" } },
    { path: "doctorId", populate: [{ path: "_id", select: "name email phone profileImage" }, { path: "specialtyId" }] },
    { path: "clinicId" },
    { path: "rescheduledFrom" }
];

const createAppointment = async (req, res) => {
try {
    const patient = await patientModel.findOne( req.user.id );
    if (!patient) {
        return res.status(404).send("patient profile not found");
    }

    const doctor = await doctorModel.findById(req.body.doctorId);
    if (!doctor) {
        return res.status(404).send("doctor not found");
    }

    const clinic = await clinicModel.findById(req.body.clinicId);
    if (!clinic) {
        return res.status(404).send("clinic not found");
    }

    const clinicMatch = doctor.clinics.some(
        (assignment) => assignment.clinicId.toString() === req.body.clinicId
    );
    if (!clinicMatch) {
        return res.status(400).send("doctor is not assigned to this clinic");
    }

    const appointment = await appointmentModel.create({
        patientId: patient._id,
        doctorId: req.body.doctorId,
        clinicId: req.body.clinicId,
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        paymentMethod: req.body.paymentMethod,
        paymentStatus: req.body.paymentStatus,
        fee: req.body.fee,
        status: req.body.status,
        rescheduledFrom: req.body.rescheduledFrom,
        cancelledBy: req.body.cancelledBy,
        cancellationReason: req.body.cancellationReason
    });

    await appointment.populate(populateAppointment);
    return res.status(201).json(appointment);
} catch (err) {
    return res.status(500).send(err.message);
}};

const getAppointments = async (req, res) => {
try {
    const appointments = await appointmentModel.find().populate(populateAppointment);
    return res.status(200).json(appointments);
} catch (err) {
    return res.status(500).send(err.message);
}};

const getMyAppointments = async (req, res) => {
try {
    const patient = await patientModel.findOne(req.user.id );
    const doctor = await doctorModel.findOne(req.user.id);

    let query = {};
    if (patient) {
        query.patientId = patient._id;
    } else if (doctor) {
        query.doctorId = doctor._id;
    } else if (req.user.role !== "admin") {
        return res.status(404).send("profile not found");
    }

    const appointments = await appointmentModel.find(query).populate(populateAppointment);
    return res.status(200).json(appointments);
} catch (err) {
    return res.status(500).send(err.message);
}};

const getAppointmentById = async (req, res) => {
try {
    const appointment = await appointmentModel.findById(req.params.id).populate(populateAppointment);
    if (!appointment) {
        return res.status(404).send("appointment not found");
    }

    if (req.user.role !== "admin") {
        const patient = await patientModel.findOne( req.user.id );
        const doctor = await doctorModel.findOne( req.user.id );
        const canAccess =
            (patient && appointment.patientId && appointment.patientId._id.toString() === patient._id.toString()) ||
            (doctor && appointment.doctorId && appointment.doctorId._id.toString() === doctor._id.toString());

        if (!canAccess) {
            return res.status(403).send("access denied");
        }
    }

    return res.status(200).json(appointment);
} catch (err) {
    return res.status(500).send(err.message);
}};

const updateAppointment = async (req, res) => {
try {
    const appointment = await appointmentModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate(populateAppointment);

    if (!appointment) {
        return res.status(404).send("appointment not found");
    }
    return res.status(200).json(appointment);
} catch (err) {
    return res.status(500).send(err.message);
}};

const cancelAppointment = async (req, res) => {
try {
    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) {
        return res.status(404).send("appointment not found");
    }

    if (req.user.role !== "admin") {
        const patient = await patientModel.findOne(req.user.id );
        const doctor = await doctorModel.findOne(req.user.id );
        const canCancel =
            (patient && appointment.patientId.toString() === patient._id.toString()) ||
            (doctor && appointment.doctorId.toString() === doctor._id.toString());

        if (!canCancel) {
            return res.status(403).send("access denied");
        }
    }

    const updated = await appointmentModel.findByIdAndUpdate(
        req.params.id,
        {
            status: "cancelled",
            cancelledBy: req.body.cancelledBy || req.user.role,
            cancellationReason: req.body.cancellationReason
        },
        { new: true, runValidators: true }
    ).populate(populateAppointment);

    return res.status(200).json(updated);
} catch (err) {
    return res.status(500).send(err.message);
}};

const completeAppointment = async (req, res) => {
    try {

        const appointment = await appointmentModel.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        // Prevent completing twice
        if (appointment.status === "completed") {
            return res.status(400).json({
                message: "Appointment is already completed."
            });
        }

        // Doctor authorization
        if (req.user.role === "doctor" && appointment.doctorId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to complete this appointment."
            });
        }

        // Find prescription
        const prescription = await prescriptionModel.findOne({
            appointmentId: appointment._id
        });

        if (!prescription) {
            return res.status(400).json({
                message: "Cannot complete appointment without a prescription."
            });
        }

        // Create patient todo
        await todoService.createFromPrescription(prescription);

        // Complete appointment
        appointment.status = "completed";

        await appointment.save();

        return res.status(200).json({
            message: "Appointment completed successfully.",
            appointment
        });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });

    }
};

module.exports = {
    createAppointment,
    getAppointments,
    getMyAppointments,
    getAppointmentById,
    updateAppointment,
    cancelAppointment,
    completeAppointment
};
