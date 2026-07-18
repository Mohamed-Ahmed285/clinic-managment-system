require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db.js");
const notificationService = require("./services/notificationService");
const { startMedicationReminderJob } = require("./jobs/medicationReminderJob");


// ========================
// Initialize Express App
// ========================
const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// ========================
// Middleware
// ========================
app.use(express.json());
app.use(cors());

// ========================
// Routes
// ========================
const userRouter = require("./routes/user");
const patientRouter = require("./routes/patient");
const clinicRouter = require("./routes/clinic");
const doctorRouter = require("./routes/doctor");
const appointmentRouter = require("./routes/appointment");
const todoRouter = require("./routes/todo.js");
const specialtyRoutes = require("./routes/specialty");
const adminUserRoutes = require("./routes/adminUserRoutes");
const adminDoctorRoutes = require("./routes/adminDoctor");
const notifications = require("./routes/notification");
const adminAnalyticsRoutes = require("./routes/adminAnalytics");
const reviewRouter = require("./routes/review");

app.use("/user", userRouter);
app.use("/patient", patientRouter);
app.use("/clinic", clinicRouter);
app.use("/doctor", doctorRouter);
app.use("/appointment", appointmentRouter);
app.use("/todo", todoRouter);

app.use("/specialty", specialtyRoutes);
app.use("/admin/users", adminUserRoutes);
app.use("/admin/doctors", adminDoctorRoutes);
app.use("/notifications", notifications);
app.use("/admin/analytics", adminAnalyticsRoutes);
app.use("/review", reviewRouter);

// ========================
// Database Connection & Server Start
// ========================
notificationService.initSocket(server);

connectDB()
  .then(() => {
    startMedicationReminderJob();

    server.listen(PORT, () => {
      console.log(`server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
