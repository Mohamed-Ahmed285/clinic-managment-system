const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addPatient,
} = require("../controllers/adminUserControl");

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", verifyToken,authorize("user:update"), updateUser);
router.delete("/:id", verifyToken,authorize("user:delete"), deleteUser);
router.post("/patient", verifyToken, authorize("user:create"), addPatient);

module.exports = router;
