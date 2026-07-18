const express = require("express");
const router = express.Router();
const {
    createPrescription,
    getPrescriptions,
    getPrescriptionsByPatient,
    getPrescriptionByAppointment,
    getPrescriptionById,
    updatePrescription,
    deletePrescription
} = require("../controllers/prescription");
const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");



router.post("/", verifyToken, authorize("prescription:create"), createPrescription);
router.get("/", verifyToken, authorize("prescription:read"), getPrescriptions);
router.get("/patient/:patientId", verifyToken, authorize("prescription:read"), getPrescriptionsByPatient);
router.get("/appointment/:appointmentId", verifyToken, authorize("prescription:read"), getPrescriptionByAppointment);
router.get("/:id", verifyToken, authorize("prescription:read"), getPrescriptionById);
router.put("/:id", verifyToken, authorize("prescription:update"), updatePrescription);
router.delete("/:id", verifyToken, authorize("prescription:delete"), deletePrescription);
module.exports = router;