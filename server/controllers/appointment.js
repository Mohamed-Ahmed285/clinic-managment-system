const appointmentModel = require("../models/appointment");
const patientModel = require("../models/patient");
const doctorModel = require("../models/doctor");
const clinicModel = require("../models/clinic");
const prescriptionModel = require("../models/prescription");
const todoModel = require("../models/todo");
const todoService = require("../services/todoService");
const notificationService = require("../services/notificationService");

const populateAppointment = [
    {
        path: "patientId",
        populate: {
            path: "_id",
            select: "name email phone profileImage"
        }
    },
    {
        path: "doctorId",
        populate: [
            {
                path: "_id",
                select: "name email phone profileImage"
            },
            {
                path: "specialtyId"
            }
        ]
    },
    {
        path: "clinicId"
    },
    {
        path: "rescheduledFrom"
    }
];

const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const parseDateInput = (value) => {
    if (!value) {
        return null;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const addMinutesToTime = (time, minutes) => {
    if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
        return null;
    }

    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + Number(minutes || 0);
    const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    const nextHours = Math.floor(normalizedMinutes / 60);
    const nextMinutes = normalizedMinutes % 60;
    return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
};

const timeToMinutes = (time) => {
    if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
        return null;
    }

    const [hours, mins] = time.split(":").map(Number);
    return hours * 60 + mins;
};

const normalizeDateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDateBounds = (date) => {
    const start = normalizeDateOnly(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
};

const getAllowedBookingWindow = () => {
    const now = new Date();
    const maxDate = new Date(now);
    maxDate.setMonth(maxDate.getMonth() + 6);
    return { now, maxDate };
};

const ensureBookingWindow = (appointmentDate) => {
    const { now, maxDate } = getAllowedBookingWindow();
    const todayStart = normalizeDateOnly(now);
    const maxStart = normalizeDateOnly(maxDate);
    const bookingStart = normalizeDateOnly(appointmentDate);

    if (bookingStart < todayStart) {
        return "appointment date cannot be in the past";
    }
    if (bookingStart > maxStart) {
        return "appointments can only be booked up to 6 months in advance";
    }
    return null;
};

const getClinicAvailabilityForDate = (doctor, clinicId, appointmentDate) => {
    const assignment = doctor.clinics.find(
        (item) => item.clinicId.toString() === clinicId.toString() && item.isActiveAtClinic !== false
    );

    if (!assignment) {
        return { error: "doctor is not assigned to this clinic" };
    }

    if (!Array.isArray(assignment.availability) || assignment.availability.length === 0) {
        return { error: "doctor has no working hours for this clinic" };
    }

    const dayName = dayNames[appointmentDate.getDay()];
    const matchedWindow = assignment.availability.find(
        (window) => Array.isArray(window.day) && window.day.includes(dayName)
    );

    if (!matchedWindow) {
        return { error: "doctor is not available on this day for this clinic" };
    }

    return { assignment, matchedWindow };
};

const ensureSlotInsideAvailability = (startTime, endTime, availability) => {
    const slotStart = timeToMinutes(startTime);
    const slotEnd = timeToMinutes(endTime);
    const windowStart = timeToMinutes(availability.startTime);
    const windowEnd = timeToMinutes(availability.endTime);

    if (
        slotStart == null ||
        slotEnd == null ||
        windowStart == null ||
        windowEnd == null
    ) {
        return "valid time format HH:MM is required";
    }

    if (slotEnd <= slotStart) {
        return "appointment must end after it starts within the same day";
    }

    if (slotStart < windowStart || slotEnd > windowEnd) {
        return "appointment time is outside clinic working hours";
    }

    return null;
};

const ensureSlotInsideClinicHours = (startTime, endTime, clinic) => {
    if (!clinic || clinic.startHour == null || clinic.endHour == null) {
        return null;
    }

    const slotStart = timeToMinutes(startTime);
    const slotEnd = timeToMinutes(endTime);
    const clinicStart = timeToMinutes(clinic.startHour);
    const clinicEnd = timeToMinutes(clinic.endHour);

    if (
        slotStart == null ||
        slotEnd == null ||
        clinicStart == null ||
        clinicEnd == null
    ) {
        return "valid time format HH:MM is required";
    }

    if (slotStart < clinicStart || slotEnd > clinicEnd) {
        return "appointment time is outside clinic working hours";
    }

    return null;
};

const ensureNoOverlap = async (appointmentId, doctorId, clinicId, appointmentDate, startTime, endTime) => {
    const { start, end } = getDateBounds(appointmentDate);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    const existingAppointments = await appointmentModel.find({
        doctorId,
        clinicId,
        date: { $gte: start, $lt: end },
        status: { $ne: "cancelled" },
        ...(appointmentId ? { _id: { $ne: appointmentId } } : {})
    });

    const hasConflict = existingAppointments.some((appointment) => {
        const existingStart = timeToMinutes(appointment.startTime);
        const existingEnd = timeToMinutes(appointment.endTime);

        if (existingStart == null || existingEnd == null) {
            return false;
        }

        return startMinutes < existingEnd && endMinutes > existingStart;
    });

    if (hasConflict) {
        return "appointment overlaps with another booking";
    }

    return null;
};

const buildAppointmentPayload = (body, doctor, patientId, clinicId, clinic) => {
    const appointmentDate = parseDateInput(body.date);
    if (!appointmentDate) {
        return { error: "valid date is required" };
    }

    const windowError = ensureBookingWindow(appointmentDate);
    if (windowError) {
        return { error: windowError };
    }

    const durationMinutes = Number(doctor.appointmentDurationMinutes);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        return { error: "doctor appointment duration is invalid" };
    }

    const startTime = body.startTime;
    const endTime = addMinutesToTime(startTime, durationMinutes);
    if (!endTime) {
        return { error: "valid startTime in HH:MM format is required" };
    }

    const clinicHoursError = ensureSlotInsideClinicHours(startTime, endTime, clinic);
    if (clinicHoursError) {
        return { error: clinicHoursError };
    }

    const clinicAvailability = getClinicAvailabilityForDate(doctor, clinicId, appointmentDate);
    if (clinicAvailability.error) {
        return { error: clinicAvailability.error };
    }

    const workingHoursError = ensureSlotInsideAvailability(startTime, endTime, clinicAvailability.matchedWindow);
    if (workingHoursError) {
        return { error: workingHoursError };
    }

    return {
        payload: {
            patientId,
            doctorId: body.doctorId,
            clinicId,
            date: appointmentDate,
            startTime,
            endTime,
            durationMinutes,
            paymentMethod: body.paymentMethod,
            paymentStatus: body.paymentStatus,
            fee: body.fee,
            status: body.status,
            rescheduledFrom: body.rescheduledFrom,
            cancelledBy: body.cancelledBy,
            cancellationReason: body.cancellationReason
        },
        appointmentDate,
        startTime,
        endTime
    };
};

const validateAppointmentRules = async (body, doctor, patientId, clinicId, clinic, appointmentId) => {
    const built = buildAppointmentPayload(body, doctor, patientId, clinicId, clinic);
    if (built.error) {
        return built;
    }

    const overlapError = await ensureNoOverlap(
        appointmentId,
        body.doctorId,
        clinicId,
        built.appointmentDate,
        built.startTime,
        built.endTime
    );

    if (overlapError) {
        return { error: overlapError };
    }

    return built;
};

const createAppointment = async (req, res) => {
    try {
        let patient = null;

        if (req.user.role === "admin") {
            if (!req.body.patientId) {
                return res.status(400).send("patientId is required for admin booking");
            }

            patient = await patientModel.findById(req.body.patientId);
        } else {
            patient = await patientModel.findOne({ _id: req.user.id });        }

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

        const built = await validateAppointmentRules(req.body, doctor, patient._id, clinic._id, clinic);
        if (built.error) {
            return res.status(400).send(built.error);
        }

        const appointment = await appointmentModel.create(built.payload);
        await appointment.populate(populateAppointment);

        await Promise.all([
            notificationService.createNotification({
                recipientId: doctor._id,
                recipientType: "doctor",
                title: "New Appointment",
                message: "A new appointment has been booked.",
                type: "appointmentBooked",
                relatedAppointmentId: appointment._id
            }),
            notificationService.createNotification({
                recipientId: patient._id,
                recipientType: "patient",
                title: "Appointment Confirmed",
                message: "Your appointment has been booked successfully.",
                type: "appointmentBooked",
                relatedAppointmentId: appointment._id
            })
        ]);

        return res.status(201).json(appointment);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel.find().populate(populateAppointment);
        return res.status(200).json(appointments);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const patient = await patientModel.findOne({ userId: req.user.id });
        const doctor = await doctorModel.findOne({ userId: req.user.id });

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
    }
};

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await appointmentModel.findById(req.params.id).populate(populateAppointment);
        if (!appointment) {
            return res.status(404).send("appointment not found");
        }

        if (req.user.role !== "admin") {
            const patient = await patientModel.findOne({ userId: req.user.id });
            const doctor = await doctorModel.findOne({ userId: req.user.id });
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
    }
};

const updateAppointment = async (req, res) => {
    try {
        const existingAppointment = await appointmentModel.findById(req.params.id);
        if (!existingAppointment) {
            return res.status(404).send("appointment not found");
        }

        const mergedBody = {
            ...existingAppointment.toObject(),
            ...req.body,
            doctorId: req.body.doctorId || existingAppointment.doctorId,
            clinicId: req.body.clinicId || existingAppointment.clinicId,
            date: req.body.date || existingAppointment.date,
            startTime: req.body.startTime || existingAppointment.startTime
        };

        const doctor = await doctorModel.findById(mergedBody.doctorId);
        if (!doctor) {
            return res.status(404).send("doctor not found");
        }

        const clinic = await clinicModel.findById(mergedBody.clinicId);
        if (!clinic) {
            return res.status(404).send("clinic not found");
        }

        const built = await validateAppointmentRules(
            mergedBody,
            doctor,
            existingAppointment.patientId,
            mergedBody.clinicId,
            clinic,
            req.params.id
        );

        if (built.error) {
            return res.status(400).send(built.error);
        }

        const appointment = await appointmentModel.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                doctorId: mergedBody.doctorId,
                clinicId: mergedBody.clinicId,
                date: built.payload.date,
                startTime: built.payload.startTime,
                endTime: built.payload.endTime,
                durationMinutes: built.payload.durationMinutes
            },
            { new: true, runValidators: true }
        ).populate(populateAppointment);

        return res.status(200).json(appointment);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const appointment = await appointmentModel.findById(req.params.id);
        if (!appointment) {
            return res.status(404).send("appointment not found");
        }

        if (req.user.role !== "admin") {
            const patient = await patientModel.findOne({ userId: req.user.id });
            const doctor = await doctorModel.findOne({ userId: req.user.id });
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

        if (req.user.role === "patient") {
            await notificationService.createNotification({
                recipientId: updated.doctorId._id,
                recipientType: "doctor",
                title: "Appointment Cancelled",
                message: "A patient cancelled the appointment.",
                type: "appointmentCancelled",
                relatedAppointmentId: updated._id
            });
        } else if (req.user.role === "doctor") {
            await notificationService.createNotification({
                recipientId: updated.patientId._id,
                recipientType: "patient",
                title: "Appointment Cancelled",
                message: "Your appointment has been cancelled by the doctor.",
                type: "appointmentCancelled",
                relatedAppointmentId: updated._id
            });
        } else if (req.user.role === "admin") {
            await Promise.all([
                notificationService.createNotification({
                    recipientId: updated.doctorId._id,
                    recipientType: "doctor",
                    title: "Appointment Cancelled",
                    message: "An appointment has been cancelled by the administration.",
                    type: "appointmentCancelled",
                    relatedAppointmentId: updated._id
                }),
                notificationService.createNotification({
                    recipientId: updated.patientId._id,
                    recipientType: "patient",
                    title: "Appointment Cancelled",
                    message: "Your appointment has been cancelled by the administration.",
                    type: "appointmentCancelled",
                    relatedAppointmentId: updated._id
                })
            ]);
        }

        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

const completeAppointment = async (req, res) => {
    try {
        const appointment = await appointmentModel.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found."
            });
        }

        if (appointment.status === "completed") {
            return res.status(400).json({
                message: "Appointment is already completed."
            });
        }

        if (req.user.role === "doctor" && appointment.doctorId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to complete this appointment."
            });
        }

        const prescription = await prescriptionModel.findOne({
            appointmentId: appointment._id
        });

        if (!prescription) {
            return res.status(400).json({
                message: "Cannot complete appointment without a prescription."
            });
        }

        await todoService.createFromPrescription(prescription);

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
