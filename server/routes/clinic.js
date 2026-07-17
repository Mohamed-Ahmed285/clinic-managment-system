const express = require("express");
const router = express.Router();
const {
    getClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic
} = require("../controllers/clinic");
const { verifyToken, isAdmin } = require("../middlewares/auth");

router.get("/", getClinics);
router.get("/:id", getClinicById);
router.post("/", verifyToken, isAdmin, createClinic);
router.put("/:id", verifyToken, isAdmin, updateClinic);
router.delete("/:id", verifyToken, isAdmin, deleteClinic);

module.exports = router;
