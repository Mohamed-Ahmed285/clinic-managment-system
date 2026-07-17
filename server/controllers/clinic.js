const clinicModel = require("../models/clinic");

const getClinics = async (req, res) => {
try {
    const clinics = await clinicModel.find();
    return res.status(200).json(clinics);
} catch (err) {
    return res.status(500).send(err.message);
}};

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
    const clinic = await clinicModel.findByIdAndDelete(req.params.id);
    if (!clinic) {
        return res.status(404).send("clinic not found");
    }
    return res.status(200).send("clinic deleted successfully");
} catch (err) {
    return res.status(500).send(err.message);
}};

module.exports = {
    getClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic
};
