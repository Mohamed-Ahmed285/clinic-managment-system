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
router.get("/me", verifyToken, "get:doctorprofile", getMyDoctorProfile);
router.get("/:id", getDoctorById);
router.put("/me", verifyToken, "update:doctorprofile", updateMyDoctorProfile);
router.post("/me/clinics", verifyToken, "add:clinicToDoctor", addClinicToMyProfile);
router.put("/me/clinics/:clinicId", verifyToken, "update:clinicToDoctor", updateClinicAssignment);
router.delete("/me/clinics/:clinicId", verifyToken, "delete:clinicFromDoctor", removeClinicFromMyProfile);




module.exports = router;
