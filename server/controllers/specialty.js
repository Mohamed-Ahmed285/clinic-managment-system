const Specialty = require("../models/specialty");

// CREATE
exports.createSpecialty = async (req, res) => {
    try {
        const specialty = await Specialty.create(req.body);
        res.status(201).json({ success: true, data: specialty });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET ALL
exports.getAllSpecialties = async (req, res) => {
    try {
        const specialties = await Specialty.find();
        res.status(200).json({ success: true, data: specialties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ONE
exports.getSpecialtyById = async (req, res) => {
    try {
        const specialty = await Specialty.findById(req.params.id);
        if (!specialty) return res.status(404).json({ success: false, message: "Specialty not found" });
        res.status(200).json({ success: true, data: specialty });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE
exports.updateSpecialty = async (req, res) => {
    try {
        const specialty = await Specialty.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!specialty) return res.status(404).json({ success: false, message: "Specialty not found" });
        res.status(200).json({ success: true, data: specialty });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE
exports.deleteSpecialty = async (req, res) => {
    try {
        const specialty = await Specialty.findByIdAndDelete(req.params.id);
        if (!specialty) return res.status(404).json({ success: false, message: "Specialty not found" });
        res.status(200).json({ success: true, message: "Specialty deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};