const notificationModel = require("../models/notification");
const notificationService = require("../services/notificationService");

const createNotification = async (data) => {
  try {
    return await notificationService.createNotification({
      recipientId: data.recipientId,
      recipientType: data.recipientType,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedAppointmentId: data.relatedAppointmentId
    });
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
        returnDocument: "after"
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

const appointmentModel = require("../models/appointment");

const getNotificationAppointment = async (req, res) => {
  try {

const notification = await notificationModel.findOne({
  _id: req.params.id,
  recipientId: req.user.id
});
    if (!notification) {
      return res.status(404).send("Notification not found");
    }

    const appointment = await appointmentModel
      .findById(notification.relatedAppointmentId)
      .populate({
        path: "patientId",
        populate: {
          path: "_id",
          select: "name email phone"
        }
      })
      .populate("clinicId");

    if (!appointment) {
      return res.status(404).send("Appointment not found");
    }

return res.status(200).json({
  patientName: appointment.patientId._id.name,
  clinicName: appointment.clinicId.name,
  date: appointment.date,
  time: appointment.startTime,
  fee: appointment.fee,
  status: appointment.status
});
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationAppointment
};
