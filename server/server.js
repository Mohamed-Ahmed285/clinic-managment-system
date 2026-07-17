require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db.js");

// ========================
// Initialize Express App
// ========================
const app = express();
const PORT = process.env.PORT;

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
const specialtyRoutes = require("./routes/specialty");
const adminUserRoutes = require("./routes/adminUserRoutes");
const doctorRoutes = require("./routes/doctor");


app.use("/user", userRouter);
app.use("/patient", patientRouter);
app.use("/clinic", clinicRouter);
app.use("/doctor", doctorRouter);
app.use("/appointment", appointmentRouter);
app.use("/api/specialty", specialtyRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/doctors", doctorRoutes);
// ========================
// Database Connection & Server Start
// ========================
connectDB();


app.listen(PORT,()=>{console.log(`server is running on port http://localhost:${PORT}`);});
