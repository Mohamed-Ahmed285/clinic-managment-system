const cron = require("node-cron");
const todoModel = require("../models/todo");
const notificationService = require("../services/notificationService");

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

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

        let todoChanged = false;

        for (const item of todo.items || []) {
          for (const scheduleItem of item.schedule || []) {
            if (scheduleItem.completed || scheduleItem.reminderSent) {
              continue;
            }

            // Only remind for the dose that belongs to today - each day of
            // the medication's course has its own schedule entry now, so
            // without this check every future day's dose would also fire
            // the moment the clock hit that time today.
            if (!isSameDay(new Date(scheduleItem.date), now)) {
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
            todoChanged = true;
          }
        }

        if (todoChanged) {
          await todo.save();
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
