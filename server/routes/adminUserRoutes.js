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
router.put("/:id", verifyToken, isAdmin, updateUser);
router.delete("/:id", verifyToken, isAdmin, deleteUser);
router.post("/patient", verifyToken, isAdmin, addPatient);

module.exports = router;
