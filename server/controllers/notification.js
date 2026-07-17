const notificationModel = require("../models/notification");

const createNotification = async (data) => {
  try {
    var notification = await notificationModel.create({
      recipientId: data.recipientId,
      recipientType: data.recipientType,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedAppointmentId: data.relatedAppointmentId
    });

    return notification;
  } catch (err) {
    throw err;
  }
};
const getMyNotifications = async (req, res) => {
  try {
    var notifications = await notificationModel
      .find({ recipientId: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
const markAsRead = async (req, res) => {
  try {
    var notification = await notificationModel.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientId: req.user.id
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).send("notification not found");
    }

    return res.status(200).json(notification);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
const markAllAsRead = async (req, res) => {
  try {
    await notificationModel.updateMany(
      {
        recipientId: req.user.id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    return res.status(200).send("all notifications marked as read");
  } catch (err) {
    return res.status(500).send(err.message);
  }
}; 

const deleteNotification = async (req, res) => {
  try {
    var notification = await notificationModel.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user.id
    });

    if (!notification) {
      return res.status(404).send("notification not found");
    }

    return res.status(200).send("notification deleted successfully");
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
