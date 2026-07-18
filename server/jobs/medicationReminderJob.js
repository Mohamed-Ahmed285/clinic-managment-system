const cron = require("node-cron");
const todoModel = require("../models/todo");
const notificationService = require("../services/notificationService");

const startMedicationReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;

      const todos = await todoModel.find({}).populate("patientId");

      for (const todo of todos) {
        if (!todo.patientId || !todo.patientId._id) {
          continue;
        }

        for (const item of todo.items || []) {
          for (const scheduleItem of item.schedule || []) {
            if (scheduleItem.completed || scheduleItem.reminderSent) {
              continue;
            }

            if (scheduleItem.time !== currentTime) {
              continue;
            }

            await notificationService.sendMedicationReminder(
              todo.patientId._id,
              item.name,
              scheduleItem.time
            );

            scheduleItem.reminderSent = true;
            await todo.save();
          }
        }
      }
    } catch (error) {
      console.error("Medication reminder job failed:", error.message);
    }
  });

  console.log("Medication reminder job started.");
};

module.exports = {
  startMedicationReminderJob
};
