const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  testNotification
} = require("../controllers/notification");
const { verifyToken, } = require("../middlewares/auth");

router.get("/", verifyToken, getMyNotifications);
router.put("/:id/read", verifyToken, markAsRead);
router.delete("/:id", verifyToken, deleteNotification);
module.exports = router;
