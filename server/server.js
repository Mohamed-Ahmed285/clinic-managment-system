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

app.use("/user", userRouter);
app.use("/patient", patientRouter);

// ========================
// Database Connection & Server Start
// ========================
connectDB();


app.listen(PORT,()=>{console.log(`server is running on port https://localhost:${PORT}`);});
