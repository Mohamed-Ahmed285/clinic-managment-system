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

router.get("/overview", verifyToken, isAdmin, getOverview);
router.get("/appointments", verifyToken, isAdmin, getAppointmentStats);
router.get("/doctors", verifyToken, isAdmin, getDoctorsStats);
router.get("/patients", verifyToken, isAdmin, getPatientStats);

router.get("/doctor-performance", verifyToken, isAdmin, getDoctorPerformance);

router.get("/specialties", verifyToken, isAdmin, getSpecialtyStats);

module.exports = router;
