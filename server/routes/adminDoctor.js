const express = require("express");
const router = express.Router();
const {
    createDoctor, updateDoctor, deleteDoctor
} = require("../controllers/adminDoctor");

router.post("/", verifyToken, isAdmin, createDoctor);
router.put("/:id", verifyToken, isAdmin, updateDoctor);
router.delete("/:id", verifyToken, isAdmin, deleteDoctor);
module.exports = router;