const Doctor = require("../models/doctor");
const User = require("../models/user");

exports.createDoctor = async (req, res) => {
    var newUser;
    try {
        newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            profileImage: req.body.profileImage,
            role: "doctor"
        });

        var doctor = await Doctor.create({
            userId: newUser._id,
            bio: req.body.bio,
            experienceYears: req.body.experienceYears,
            specialtyId: req.body.specialtyId,
            clinics: req.body.clinics
        });

        res.status(201).json({ success: true, data: doctor });

    } catch (error) {
        if (newUser) {
            await User.findByIdAndDelete(newUser._id);
        }
        res.status(400).json({ success: false, message: error.message });
    }
};



exports.updateDoctor = async (req, res) => {
    try {
        var doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        res.status(200).json({ success: true, data: doctor });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        var doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        res.status(200).json({ success: true, message: "Doctor deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};