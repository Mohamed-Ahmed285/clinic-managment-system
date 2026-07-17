const express = require("express");
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getMyAppointments,
    getAppointmentById,
    updateAppointment,
    cancelAppointment
} = require("../controllers/appointment");
const { verifyToken, isAdmin, isDoctor, isPatient } = require("../middlewares/auth");

router.post("/", verifyToken, isPatient, createAppointment);
router.get("/", verifyToken, isAdmin, getAppointments);
router.get("/my", verifyToken, getMyAppointments);
router.get("/:id", verifyToken, getAppointmentById);
router.put("/:id", verifyToken, isAdmin, updateAppointment);
router.patch("/:id/cancel", verifyToken, cancelAppointment);

module.exports = router;
