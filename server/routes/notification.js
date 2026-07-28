const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationAppointment
} = require("../controllers/notification");
const { verifyToken, } = require("../middlewares/auth");

router.get("/", verifyToken, getMyNotifications);
router.get("/:id/details",verifyToken,getNotificationAppointment);
router.put("/:id/read", verifyToken, markAsRead);
router.delete("/:id", verifyToken, deleteNotification);
module.exports = router;
