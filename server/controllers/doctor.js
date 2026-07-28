const doctorModel = require("../models/doctor");
const userModel = require("../models/user");
const appointmentModel = require("../models/appointment");
const specialtyModel = require('../models/specialty');
const clinicModel=require("../models/clinic")

const populateDoctor = [
    { path: "_id", select: "name email phone profileImage role" },
    { path: "specialtyId" },
    { path: "clinics.clinicId" }
];

const getDoctors = async (req, res) => {
try {
    const doctors = await doctorModel.find().populate(populateDoctor);
    return res.status(200).json(doctors);
} catch (err) {
    return res.status(500).send(err.message);
}};

// const getDoctorsPaginated = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || "";

//     const skip = (page - 1) * limit;

//     let query = {};

//     if (search) {
//       const [matchingUsers, matchingSpecialties, matchingClinics] =
//         await Promise.all([
//           userModel.find({
//             role: "doctor",
//             $or: [
//               { name: { $regex: search, $options: "i" } },
//               { email: { $regex: search, $options: "i" } },
//             ],
//           }).select("_id"),

//           specialtyModel.find({
//             name: { $regex: search, $options: "i" },
//           }).select("_id"),

//           clinicModel.find({
//             "address.state": { $regex: search, $options: "i" },
//           }).select("_id"),
//         ]);

//       const userIds = matchingUsers.map(user => user._id);
//       const specialtyIds = matchingSpecialties.map(spec => spec._id);
//       const clinicIds = matchingClinics.map(clinic => clinic._id);

//       query = {
//         $or: [
//           { _id: { $in: userIds } },
//           { specialtyId: { $in: specialtyIds } },
//           { "clinics.clinicId": { $in: clinicIds } },
//         ],
//       };
//     }

//     const [doctors, totalDoctors] = await Promise.all([
//       doctorModel
//         .find(query)
//         .populate(populateDoctor)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit),

//       doctorModel.countDocuments(query),
//     ]);

//     res.status(200).json({
//       doctors,
//       currentPage: page,
//       totalPages: Math.ceil(totalDoctors / limit),
//       totalDoctors,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: err.message,
//     });
//   }
// };
const getDoctorsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search?.trim() || "";
    const specialty = req.query.specialty?.trim() || "";
    const state = req.query.state?.trim() || "";

    const skip = (page - 1) * limit;

    const andConditions = [];

    // Search by doctor name/email
    if (search) {
      const matchingUsers = await userModel
        .find({
          role: "doctor",
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        })
        .select("_id");

      andConditions.push({
        _id: { $in: matchingUsers.map((user) => user._id) }
      });
    }

    // Filter by specialty
    if (specialty) {
      const matchingSpecialties = await specialtyModel
        .find({
          name: { $regex: specialty, $options: "i" }
        })
        .select("_id");

      andConditions.push({
        specialtyId: {
          $in: matchingSpecialties.map((spec) => spec._id)
        }
      });
    }

    // Filter by state
    if (state) {
      const matchingClinics = await clinicModel
        .find({
          "address.state": { $regex: state, $options: "i" }
        })
        .select("_id");

      andConditions.push({
        "clinics.clinicId": {
          $in: matchingClinics.map((clinic) => clinic._id)
        }
      });
    }

    const query = andConditions.length ? { $and: andConditions } : {};

    const [doctors, totalDoctors] = await Promise.all([
      doctorModel
        .find(query)
        .populate(populateDoctor)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      doctorModel.countDocuments(query)
    ]);

    res.status(200).json({
      doctors,
      currentPage: page,
      totalPages: Math.ceil(totalDoctors / limit),
      totalDoctors
    });
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};
const getDoctorById = async (req, res) => {
try {
    const doctor = await doctorModel.findById(req.params.id).populate(populateDoctor);
    if (!doctor) {
        return res.status(404).send("doctor not found");
    }
    return res.status(200).json(doctor);
} catch (err) {
    return res.status(500).send(err.message);
}};

const getMyDoctorProfile = async (req, res) => {
    try {

        const doctor = await doctorModel
            .findById(req.user.id)
            .populate(populateDoctor);

        if (!doctor) {
            return res.status(404).send("Doctor profile not found");
        }

        return res.status(200).json(doctor);

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

const updateMyDoctorProfile = async (req, res) => {
    try {

        // Check if doctor exists
        const existingDoctor = await doctorModel.findById(req.user.id);

        if (!existingDoctor) {
            return res.status(404).send("Doctor profile not found");
        }

        // Check email uniqueness
        if (req.body.email) {

            const existingUser = await userModel.findOne({
                email: req.body.email,
                _id: { $ne: req.user.id }
            });

            if (existingUser) {
                return res.status(400).send("Email already exists");
            }
        }

        // ===========================
        // Update User document
        // ===========================

        const userUpdates = {};

        if (req.body.name !== undefined)
            userUpdates.name = req.body.name;

        if (req.body.email !== undefined)
            userUpdates.email = req.body.email;

        if (req.body.phone !== undefined)
            userUpdates.phone = req.body.phone;

        if (req.body.profileImage !== undefined)
            userUpdates.profileImage = req.body.profileImage;

        await userModel.findByIdAndUpdate(
            req.user.id,
            userUpdates,
            {
                new: true,
                runValidators: true
            }
        );

        // ===========================
        // Update Doctor document
        // ===========================

        const doctorUpdates = {};

        if (req.body.bio !== undefined)
            doctorUpdates.bio = req.body.bio;

        if (req.body.experienceYears !== undefined)
            doctorUpdates.experienceYears = Number(req.body.experienceYears);

        if (req.body.specialtyId !== undefined)
            doctorUpdates.specialtyId = req.body.specialtyId;

        if (req.body.appointmentDurationMinutes !== undefined)
            doctorUpdates.appointmentDurationMinutes =
                Number(req.body.appointmentDurationMinutes);

        const doctor = await doctorModel.findByIdAndUpdate(
            req.user.id,
            doctorUpdates,
            {
                new: true,
                runValidators: true
            }
        ).populate(populateDoctor);

        return res.status(200).json(doctor);

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

const addClinicToMyProfile = async (req, res) => {
try {
    const doctor = await doctorModel.findById(req.user.id);
    if (!doctor) {
        return res.status(404).send("doctor profile not found");
    }

    const clinicAssignment = {
        clinicId: req.body.clinicId,
        consultationFee: req.body.consultationFee,
        availability: req.body.availability,
        isActiveAtClinic: req.body.isActiveAtClinic
    };

    doctor.clinics.push(clinicAssignment);
    await doctor.save();

    await doctor.populate(populateDoctor);
    return res.status(200).json(doctor);
} catch (err) {
    return res.status(500).send(err.message);
}};

const updateClinicAssignment = async (req, res) => {
try {
    const doctor = await doctorModel.findById(req.user.id);
    if (!doctor) {
        return res.status(404).send("doctor profile not found");
    }

    const assignment = doctor.clinics.find((item) => item.clinicId.toString() === req.params.clinicId);
    if (!assignment) {
        return res.status(404).send("clinic assignment not found");
    }

    assignment.consultationFee = req.body.consultationFee ?? assignment.consultationFee;
    assignment.availability = req.body.availability ?? assignment.availability;
    assignment.isActiveAtClinic = req.body.isActiveAtClinic ?? assignment.isActiveAtClinic;

    await doctor.save();
    await doctor.populate(populateDoctor);
    return res.status(200).json(doctor);
} catch (err) {
    return res.status(500).send(err.message);
}};

const removeClinicFromMyProfile = async (req, res) => {
try {
    const doctor = await doctorModel.findById(req.user.id);
    if (!doctor) {
        return res.status(404).send("doctor profile not found");
    }

    doctor.clinics = doctor.clinics.filter((item) => item.clinicId.toString() !== req.params.clinicId);
    await doctor.save();
    await doctor.populate(populateDoctor);
    return res.status(200).json(doctor);
} catch (err) {
    return res.status(500).send(err.message);
}};

const uploadDoctorPhoto = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).send("No image uploaded");
        }


        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                profileImage: req.file.path
            },
            {
                new: true
            }
        );


        return res.status(200).json({
            message: "Profile image uploaded successfully",
            profileImage: user.profileImage
        });


    } catch (err) {
        return res.status(500).send(err.message);
    }
};
const getDoctorDashboard = async (req, res) => {
    try {

        const doctor = await doctorModel
            .findById(req.user.id)
            .populate(populateDoctor);

        if (!doctor) {
            return res.status(404).send("Doctor profile not found");
        }

        const today = new Date();

        const startOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );

        const endOfDay = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1
        );

        const todayAppointments = await appointmentModel
            .find({
                doctorId: doctor._id,
                date: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            })
            .populate([
                {
                    path: "patientId",
                    populate: {
                        path: "_id",
                        select: "name profileImage"
                    }
                },
                {
                    path: "clinicId",
                    select: "name"
                }
            ])
            .sort({ startTime: 1 });

        const activePatients = await appointmentModel.distinct(
            "patientId",
            {
                doctorId: doctor._id,
                status: {
                    $ne: "cancelled"
                }
            }
        );
        const totalAppointments = await appointmentModel.countDocuments({
  doctorId: doctor._id
});

const completedAppointments = await appointmentModel.countDocuments({
  doctorId: doctor._id,
  status: "completed"
});

const cancelledAppointments = await appointmentModel.countDocuments({
  doctorId: doctor._id,
  status: "cancelled"
});

        res.status(200).json({

            doctor: {
                name: doctor._id.name,
                email: doctor._id.email,
                phone: doctor._id.phone,
                profileImage: doctor._id.profileImage,
                specialty: doctor.specialtyId,
                rating: doctor.rating
            },

            stats: {

                activePatients: 
                activePatients.length,

                totalAppointments:
                 totalAppointments,

               completedAppointments:
                completedAppointments,

               cancelledAppointments: 
               cancelledAppointments,
                
               appointmentDuration:
                doctor.appointmentDurationMinutes
            },

            todayAppointments

        });

    } catch (err) {
        res.status(500).send(err.message);
    }
};
const getActivePatients = async (req, res) => {
  try {

    const doctor = await doctorModel.findById(req.user.id);

    if (!doctor) {
      return res.status(404).send("Doctor profile not found");
    }

    const patients = await appointmentModel.find({
      doctorId: doctor._id,
      status: { $ne: "cancelled" }
    })
    .populate({
      path: "patientId",
      populate: {
        path: "_id",
        select: "name email phone profileImage"
      }
    });

    const uniquePatients = [];

    const patientIds = new Set();

    patients.forEach((appointment) => {

      const patient = appointment.patientId;

      if (
        patient &&
        patient._id &&
        !patientIds.has(patient._id._id.toString())
      ) {

        patientIds.add(patient._id._id.toString());

        uniquePatients.push({
          id: patient._id._id,
          name: patient._id.name,
          email: patient._id.email,
          phone: patient._id.phone,
          profileImage: patient._id.profileImage
        });

      }

    });

    res.status(200).json(uniquePatients);

  } catch (err) {
    res.status(500).send(err.message);
  }
};
const getDoctorAppointments = async (req, res) => {
  try {

    const doctor = await doctorModel.findById(req.user.id);

    if (!doctor) {
      return res.status(404).send("Doctor profile not found");
    }

    const appointments = await appointmentModel
      .find({ doctorId: doctor._id })
      .populate({
        path: "patientId",
        populate: {
          path: "_id",
          select: "name phone"
        }
      })
      .populate({
        path: "clinicId",
        select: "name"
      })
      .sort({ date: -1, startTime: 1 });

    res.status(200).json(appointments);

  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
    getDoctors,
    getDoctorById,
    getMyDoctorProfile,
    updateMyDoctorProfile,
    addClinicToMyProfile,
    updateClinicAssignment,
    removeClinicFromMyProfile,
    uploadDoctorPhoto,
    getDoctorDashboard,
    getDoctorsPaginated,
    getActivePatients,
    getDoctorAppointments
    
};
