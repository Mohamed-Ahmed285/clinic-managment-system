const express = require("express");
const router = express.Router();
const {
    createSpecialty,
    getAllSpecialties,
    getSpecialtyById,
    updateSpecialty,
    deleteSpecialty
} = require("../controllers/specialty");

router.post("/", verifyToken, isAdmin, createSpecialty);
router.get("/", getAllSpecialties);
router.get("/:id", getSpecialtyById);
router.put("/:id", verifyToken, isAdmin, updateSpecialty);
router.delete("/:id", verifyToken, isAdmin,deleteSpecialty);

module.exports = router;