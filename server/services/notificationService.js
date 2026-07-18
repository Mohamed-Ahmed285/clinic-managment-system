const notificationModel = require("../models/notification");
const todoModel = require("../models/todo");

let io = null;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userId) => {
      if (userId) {
        socket.join(userId.toString());
      }
    });
  });

  return io;
};

const getIo = () => io;

const createNotification = async ({ recipientId, recipientType, title, message, type = "system", relatedAppointmentId = null }) => {
  try {
    const notification = await notificationModel.create({
      recipientId,
      recipientType,
      title,
      message,
      type,
      relatedAppointmentId,
      isRead: false
    });

    if (io) {
      io.to(recipientId.toString()).emit("notification", {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    throw error;
  }
};

const sendMedicationReminder = async (patientId, medicationName, doseTime) => {
  if (!patientId) {
    return null;
  }

  const title = "Medication Reminder";
  const message = `It's time to take ${medicationName} at ${doseTime}.`;

  const notification = await createNotification({
    recipientId: patientId,
    recipientType: "patient",
    title,
    message,
    type: "MedicalReminder"
  });

  if (io) {
    io.to(patientId.toString()).emit("medicationReminder", {
      title,
      message,
      medication: medicationName,
      time: doseTime
    });
  }

  return notification;
};

module.exports = {
  initSocket,
  getIo,
  createNotification,
  sendMedicationReminder
};
