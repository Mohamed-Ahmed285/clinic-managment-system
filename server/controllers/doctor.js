const doctorModel = require("../models/doctor");
const userModel = require("../models/user");
const specialtyModel = require('../models/specialty');


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

const getDoctorsPaginated = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      // (by name or email)
      const matchingUsers = await userModel.find({
        role: "doctor", // Ensure we only grab doctor users
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ]
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);

      const matchingSpecialties = await specialtyModel.find({
        name: { $regex: search, $options: "i" } 
      }).select('_id');
      
      const specialtyIds = matchingSpecialties.map(spec => spec._id);

      query = {
        $or: [
          { _id: { $in: userIds } },
          { specialtyId: { $in: specialtyIds } }
        ]
      };
    }

    // 3. Fetch Doctors and Count
    const [doctors, totalDoctors] = await Promise.all([
      doctorModel
        .find(query)
        .populate(populateDoctor)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      doctorModel.countDocuments(query),
    ]);

    res.status(200).json({
      doctors,
      currentPage: page,
      totalPages: Math.ceil(totalDoctors / limit),
      totalDoctors,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
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

module.exports = {
    getDoctors,
    getDoctorById,
    getMyDoctorProfile,
    updateMyDoctorProfile,
    addClinicToMyProfile,
    updateClinicAssignment,
    removeClinicFromMyProfile,
    uploadDoctorPhoto,
    getDoctorsPaginated
};
