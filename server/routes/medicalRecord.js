const express = require("express");
const router = express.Router();
const {
    createMedicalRecord,
    getMedicalRecords,
    getMedicalRecordsByPatient,
    getMedicalRecordsByAppointment,
    getMedicalRecordById,
    updateMedicalRecord,
    deleteMedicalRecord
} = require("../controllers/medicalRecord");
const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

router.post("/", verifyToken, authorize("medicalRecord:create"), createMedicalRecord);
router.get("/", verifyToken, authorize("medicalRecord:read"), getMedicalRecords);
router.get("/patient/:patientId", verifyToken, authorize("medicalRecord:read"), getMedicalRecordsByPatient);
router.get("/appointment/:appointmentId", verifyToken, authorize("medicalRecord:read"), getMedicalRecordsByAppointment);
router.get("/:id", verifyToken, authorize("medicalRecord:read"), getMedicalRecordById);
router.put("/:id", verifyToken, authorize("medicalRecord:update"), updateMedicalRecord);
router.delete("/:id", verifyToken, authorize("medicalRecord:delete"), deleteMedicalRecord);

module.exports = router;
