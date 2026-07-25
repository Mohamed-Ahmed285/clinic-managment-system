const express = require("express");
const router = express.Router();
const {
    getClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
    getClinicsPaginated
} = require("../controllers/clinic");
const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

router.get("/", getClinics);
router.get("/search", verifyToken ,authorize("search:clinics") , getClinicsPaginated);
router.get("/:id", getClinicById);
router.post("/", verifyToken, authorize("create:clinic"), createClinic);
router.put("/:id", verifyToken, authorize("update:clinic"), updateClinic);
router.delete("/:id", verifyToken, authorize("delete:clinic"), deleteClinic);

module.exports = router;
