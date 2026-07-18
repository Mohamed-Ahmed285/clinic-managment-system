const express = require("express");
const router = express.Router();

const {
  getOverview,
  getAppointmentStats,
  getDoctorsStats,
  getPatientStats,
  getDoctorPerformance,
  getSpecialtyStats,
} = require("../controllers/adminAnalytics");

const { verifyToken, isAdmin } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

router.get("/overview", verifyToken, authorize("analytics:read"), getOverview);
router.get("/appointments", verifyToken, authorize("analytics:read"), getAppointmentStats);
router.get("/doctors", verifyToken, authorize("analytics:read"), getDoctorsStats);
router.get("/patients", verifyToken, authorize("analytics:read"), getPatientStats);
router.get("/doctor-performance", verifyToken, authorize("analytics:read"), getDoctorPerformance);
router.get("/specialties", verifyToken, authorize("analytics:read"), getSpecialtyStats);

module.exports = router;
