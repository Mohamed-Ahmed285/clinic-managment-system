const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

const express = require("express");
const router = express.Router();
const {
    createDoctor, updateDoctor, deleteDoctor
} = require("../controllers/adminDoctor");

router.post("/", verifyToken,authorize("doctor:create") , createDoctor);
router.put("/:id", verifyToken,authorize("doctor:update") , updateDoctor);
router.delete("/:id", verifyToken,authorize("doctor:delete") , deleteDoctor);
module.exports = router;