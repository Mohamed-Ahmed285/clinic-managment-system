const appointmentModel = require("../models/appointment");
const doctorModel = require("../models/doctor");
const patientModel = require("../models/patient");
const resolveAppointmentForDoctor = async (req, appointmentId) => {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
        return { error: { status: 404, message: "appointment not found" } };
    }
    if (req.user.role === "admin") {
        return {
            appointment,
            patientId: appointment.patientId,
            doctorId: appointment.doctorId
        };
    }
    const doctor = await doctorModel.findById(req.user.id);
    if (!doctor || appointment.doctorId.toString() !== doctor._id.toString()) {
        return { error: { status: 403, message: "access denied" } };
    }
    return {
        appointment,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId
    };
};
const canAccessPatientClinicalData = async (req, patientId) => {
    if (req.user.role === "admin") {
        return true;
    }
    const patient = await patientModel.findOne(req.user.id);
    if (patient && patient._id.toString() === patientId.toString()) {
        return true;
    }
    const doctor = await doctorModel.findOne(req.user.id);
    if (doctor) {
        const hasAppointment = await appointmentModel.exists({
            doctorId: doctor._id,
            patientId
        });
        return !!hasAppointment;
    }
    return false;
};
module.exports = {
    resolveAppointmentForDoctor,
    canAccessPatientClinicalData
};