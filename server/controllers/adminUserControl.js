const User = require("../models/user");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");

exports.getAllUsers = async (req, res) => {
    try {
        var filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: "i" };
        }

        var users = await User.find(filter).select("-password");
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        var user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        var profile = null;
        if (user.role === "patient") {
            profile = await Patient.findById(user._id);
        } else if (user.role === "doctor") {
            profile = await Doctor.findById(user._id).populate("specialtyId");
        }

        res.status(200).json({ success: true, data: { user, profile } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUser = async (req, res) => {
    try {
        var user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                phone: req.body.phone,
                profileImage: req.body.profileImage
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        var profile = null;
        if (user.role === "patient") {
            profile = await Patient.findByIdAndUpdate(
                user._id,
                {
                    dateOfBirth: req.body.dateOfBirth,
                    gender: req.body.gender,
                    address: req.body.address,
                    preferredPaymentMethod: req.body.preferredPaymentMethod,
                    notificationsEnabled: req.body.notificationsEnabled
                },
                { new: true, runValidators: true }
            );
        } else if (user.role === "doctor") {
            profile = await Doctor.findByIdAndUpdate(
                user._id,
                {
                    bio: req.body.bio,
                    experienceYears: req.body.experienceYears,
                    specialtyId: req.body.specialtyId,
                    appointmentDurationMinutes: req.body.appointmentDurationMinutes
                },
                { new: true, runValidators: true }
            );
        }

        res.status(200).json({ success: true, data: { user, profile } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        var user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role === "patient") {
            await Patient.findByIdAndDelete(user._id);
        } else if (user.role === "doctor") {
            await Doctor.findByIdAndDelete(user._id);
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

