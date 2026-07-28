const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/adminUserControl");

router.get("/",verifyToken,authorize("users:get") ,getAllUsers);
router.get("/:id",verifyToken,authorize("user:get") ,getUserById);
router.put("/:id", verifyToken,authorize("user:update"), updateUser);
router.delete("/:id", verifyToken,authorize("user:delete"), deleteUser);


module.exports = router;
