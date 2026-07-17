const doctorModel = require("../models/doctor");
const userModel = require("../models/user");

const populateDoctor = [
    { path: "userId", select: "name email phone profileImage role" },
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
    const doctor = await doctorModel.findOne({ userId: req.user.id }).populate(populateDoctor);
    if (!doctor) {
        return res.status(404).send("doctor profile not found");
    }
    return res.status(200).json(doctor);
} catch (err) {
    return res.status(500).send(err.message);
}};

const updateMyDoctorProfile = async (req, res) => {
try {
    const doctor = await doctorModel.findOneAndUpdate(
        { userId: req.user.id },
        {
            bio: req.body.bio,
            experienceYears: req.body.experienceYears,
            specialtyId: req.body.specialtyId
        },
        { new: true, runValidators: true }
    ).populate(populateDoctor);

    if (!doctor) {
        return res.status(404).send("doctor profile not found");
    }
    return res.status(200).json(doctor);
} catch (err) {
    return res.status(500).send(err.message);
}};

const addClinicToMyProfile = async (req, res) => {
try {
    const doctor = await doctorModel.findOne({ userId: req.user.id });
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
    const doctor = await doctorModel.findOne({ userId: req.user.id });
    if (!doctor) {
        return res.status(404).send("doctor profile not found");
    }

    const assignment = doctor.clinics.find((item) => item.clinicId.toString() === req.params.clinicId);
    if (!assignment) {
        return res.status(404).send("clinic assignment not found");
    }

    assignment.clinicId = req.body.clinicId || assignment.clinicId;
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
    const doctor = await doctorModel.findOne({ userId: req.user.id });
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

module.exports = {
    getDoctors,
    getDoctorById,
    getMyDoctorProfile,
    updateMyDoctorProfile,
    addClinicToMyProfile,
    updateClinicAssignment,
    removeClinicFromMyProfile
};
