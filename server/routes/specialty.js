const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const express = require("express");
const router = express.Router();
const {
    createSpecialty,
    getAllSpecialties,
    getSpecialtyById,
    updateSpecialty,
    deleteSpecialty
} = require("../controllers/specialty");

router.post("/", verifyToken, authorize("create:speciality"), createSpecialty);
router.get("/", getAllSpecialties);
router.get("/:id", getSpecialtyById);
router.put("/:id", verifyToken, authorize("update:speciality"), updateSpecialty);
router.delete("/:id", verifyToken, authorize("delete:speciality"),deleteSpecialty);

module.exports = router;