const User = require("../models/user");
const Doctor = require("../models/doctor");
const Clinic = require("../models/clinic");
const Appointment = require("../models/appointment");
const Patient = require("../models/patient");

exports.getOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalClinics = await Clinic.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalClinics,
        totalAppointments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAppointmentStats = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();

    const pending = await Appointment.countDocuments({
      status: "pending",
    });

    const confirmed = await Appointment.countDocuments({
      status: "confirmed",
    });

    const completed = await Appointment.countDocuments({
      status: "completed",
    });

    const cancelled = await Appointment.countDocuments({
      status: "cancelled",
    });

    const rescheduled = await Appointment.countDocuments({
      status: "rescheduled",
    });

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        pending,
        confirmed,
        completed,
        cancelled,
        rescheduled,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDoctorPerformance = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate({
        path: "_id",
        select: "name",
      })
      .populate("specialtyId", "name");

    const performance = doctors
      .filter((doctor) => doctor._id && doctor.specialtyId)
      .map((doctor) => ({
        doctor: doctor._id.name,
        specialty: doctor.specialtyId.name,
        averageRating: doctor.rating.average,
        ratingCount: doctor.rating.count,
        totalAppointments: doctor.bookingStats.totalAppointments,
        completedAppointments: doctor.bookingStats.completedAppointments,
        cancelledAppointments: doctor.bookingStats.cancelledAppointments,
      }));

    res.status(200).json({
      success: true,
      data: performance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDoctorsStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();

    const doctorsBySpecialty = await Doctor.aggregate([
      {
        $group: {
          _id: "$specialtyId",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "specialties",
          localField: "_id",
          foreignField: "_id",
          as: "specialty",
        },
      },
      {
        $unwind: "$specialty",
      },
      {
        $project: {
          _id: 0,
          specialty: "$specialty.name",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        doctorsBySpecialty,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPatientStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSpecialtyStats = async (req, res) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
      },
      {
        $group: {
          _id: "$doctor.specialtyId",
          appointments: {
            $sum: 1,
          },
        },
      },
      {
        $lookup: {
          from: "specialties",
          localField: "_id",
          foreignField: "_id",
          as: "specialty",
        },
      },
      {
        $unwind: "$specialty",
      },
      {
        $project: {
          _id: 0,
          specialty: "$specialty.name",
          appointments: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
