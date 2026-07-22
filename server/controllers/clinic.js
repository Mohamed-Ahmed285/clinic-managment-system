const clinicModel = require("../models/clinic");

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

const getClinics = async (req, res) => {
try {
    const validationError = validateClinicHours(req.body);
    if (validationError) {
        return res.status(400).send(validationError);
    }
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
