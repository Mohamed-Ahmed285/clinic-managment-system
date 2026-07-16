require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db.js");

// ========================
// Initialize Express App
// ========================
const app = express();
const PORT = process.env.PORT || 5000;

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

app.use("/user", userRouter);
app.use("/patient", patientRouter);

// ========================
// Database Connection & Server Start
// ========================
connectDB();