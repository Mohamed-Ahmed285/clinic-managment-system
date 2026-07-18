const express = require("express");
const router = express.Router();
const {
    createAppointment,
    getAppointments,
    getMyAppointments,
    getAppointmentById,
    updateAppointment,
    cancelAppointment,
    completeAppointment
} = require("../controllers/appointment");
const { verifyToken} = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

router.post("/", verifyToken, authorize("create:appointment"), createAppointment);
router.get("/", verifyToken, authorize("get:appointments"), getAppointments);
router.get("/my", verifyToken, authorize("get:myappointments") ,getMyAppointments);
router.get("/:id", verifyToken,getAppointmentById);
router.put("/:id", verifyToken, authorize("update:appointments"), updateAppointment);
router.patch("/:id/cancel", verifyToken, authorize("cancel:appointment") ,cancelAppointment);
router.patch("/:id/complete",verifyToken,authorize("update:appointment:"),completeAppointment);
module.exports = router;
