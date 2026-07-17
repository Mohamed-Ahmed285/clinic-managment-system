const express = require("express");
const router = express.Router();
const {
    getDoctors,
    getDoctorById,
    getMyDoctorProfile,
    updateMyDoctorProfile,
    addClinicToMyProfile,
    updateClinicAssignment,
    removeClinicFromMyProfile
} = require("../controllers/doctor");
const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

router.get("/", getDoctors);
router.get("/me", verifyToken, isDoctor, getMyDoctorProfile);
router.get("/:id", getDoctorById);
router.put("/me", verifyToken, isDoctor, updateMyDoctorProfile);
router.post("/me/clinics", verifyToken, isDoctor, addClinicToMyProfile);
router.put("/me/clinics/:clinicId", verifyToken, isDoctor, updateClinicAssignment);
router.delete("/me/clinics/:clinicId", verifyToken, isDoctor, removeClinicFromMyProfile);

module.exports = router;
