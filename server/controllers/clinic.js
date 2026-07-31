const clinicModel = require("../models/clinic");
const appointmentModel = require("../models/appointment");
const doctorModel = require("../models/doctor");
const notificationService = require("../services/notificationService");

const timePattern = /^\d{2}:\d{2}$/;

const timeToMinutes = (time) => {
    if (typeof time !== "string" || !timePattern.test(time)) {
        return null;
    }

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

const validateClinicHours = (body, existingClinic = null) => {
    const startHour = body.startHour ?? existingClinic?.startHour;
    const endHour = body.endHour ?? existingClinic?.endHour;

    if ((startHour == null) !== (endHour == null)) {
        return "startHour and endHour must be provided together";
    }

    if (startHour == null || endHour == null) {
        return null;
    }

    const startMinutes = timeToMinutes(startHour);
    const endMinutes = timeToMinutes(endHour);

    if (startMinutes == null || endMinutes == null) {
        return "clinic hours must use HH:MM format";
    }

    if (endMinutes <= startMinutes) {
        return "clinic endHour must be after startHour";
    }

    return null;
};

// const getClinics = async (req, res) => {
// try {
//     const validationError = validateClinicHours(req.body);
//     if (validationError) {
//         return res.status(400).send(validationError);
//     }
//     const clinics = await clinicModel.find();
//     return res.status(200).json(clinics);
// } catch (err) {
//     return res.status(500).send(err.message);
// }};
const getClinics = async (req, res) => {
    try {

        const clinics = await clinicModel.find();

        return res.status(200).json(clinics);

    } catch (err) {

        console.error("getClinics error:", err);

        return res.status(500).send(err.message);

    }
};

const getClinicsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    let query = {};

    // Adjusted search fields for typical Clinic attributes
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [clinics, totalClinics] = await Promise.all([
      clinicModel
        .find(query)
        // .populate(populateClinic) // Ensure you have this defined if you are populating refs
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      clinicModel.countDocuments(query),
    ]);

    res.status(200).json({
      clinics,
      currentPage: page,
      totalPages: Math.ceil(totalClinics / limit),
      totalClinics,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};



const getClinicById = async (req, res) => {
try {
    const clinic = await clinicModel.findById(req.params.id);
    if (!clinic) {
        return res.status(404).send("clinic not found");
    }
    return res.status(200).json(clinic);
} catch (err) {
    return res.status(500).send(err.message);
}};

const createClinic = async (req, res) => {
try {
    const clinic = await clinicModel.create(req.body);
    return res.status(201).json(clinic);
} catch (err) {
    return res.status(500).send(err.message);
}};

const updateClinic = async (req, res) => {
try {
     const existingClinic = await clinicModel.findById(req.params.id);
    if (!existingClinic) {
        return res.status(404).send("clinic not found");
    }

    const validationError = validateClinicHours(req.body, existingClinic);
    if (validationError) {
        return res.status(400).send(validationError);
    }
    const clinic = await clinicModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!clinic) {
        return res.status(404).send("clinic not found");
    }
    return res.status(200).json(clinic);
} catch (err) {
    return res.status(500).send(err.message);
}};

const deleteClinic = async (req, res) => {
try {
    const clinic = await clinicModel.findById(req.params.id);
    if (!clinic) {
        return res.status(404).send("clinic not found");
    }

    // Only today-and-future appointments at this clinic that aren't already
    // cancelled/completed are affected by the clinic closing down.
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const affectedAppointments = await appointmentModel.find({
        clinicId: clinic._id,
        status: { $nin: ["cancelled", "completed"] },
        date: { $gte: todayStart }
    });

    // Cancel each affected appointment, mark online-paid ones as refunded
    // (refund itself is handled manually/offline), and notify the patient.
    await Promise.all(
        affectedAppointments.map(async (appointment) => {
            appointment.status = "cancelled";
            appointment.cancelledBy = "admin";
            appointment.cancellationReason = "Clinic has been removed";

            const wasPaidOnline = appointment.paymentMethod === "online" && appointment.paymentStatus === "paid";
            if (wasPaidOnline) {
                appointment.paymentStatus = "refunded";
            }

            await appointment.save();

            const message = wasPaidOnline
                ? `Your appointment at ${clinic.name} has been cancelled because the clinic is no longer available. Since you paid online, your payment has been marked as refunded and will be processed manually.`
                : `Your appointment at ${clinic.name} has been cancelled because the clinic is no longer available.`;

            return notificationService.createNotification({
                recipientId: appointment.patientId,
                recipientType: "patient",
                title: "Appointment Cancelled",
                message,
                type: "appointmentCancelled",
                relatedAppointmentId: appointment._id
            });
        })
    );

    // Every doctor currently assigned to this clinic, not just those with
    // upcoming appointments, needs to know the clinic is gone.
    const affectedDoctors = await doctorModel.find({ "clinics.clinicId": clinic._id });

    await Promise.all(
        affectedDoctors.map(async (doctor) => {
            doctor.clinics = doctor.clinics.filter(
                (assignment) => assignment.clinicId.toString() !== clinic._id.toString()
            );
            await doctor.save();

            return notificationService.createNotification({
                recipientId: doctor._id,
                recipientType: "doctor",
                title: "Clinic Removed",
                message: `${clinic.name} has been removed by the administration. It has been removed from your assigned clinics, and any of your upcoming appointments there have been cancelled.`,
                type: "system"
            });
        })
    );

    await clinicModel.findByIdAndDelete(clinic._id);

    return res.status(200).json({
        message: "clinic deleted successfully",
        cancelledAppointments: affectedAppointments.length,
        notifiedDoctors: affectedDoctors.length
    });
} catch (err) {
    return res.status(500).send(err.message);
}};

module.exports = {
    getClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
    getClinicsPaginated
};