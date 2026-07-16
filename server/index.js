require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT;

app.use(express.json());

const userRouter = require("./routes/user");
const patientRouter = require("./routes/patient");

app.use("/user", userRouter);
app.use("/patient", patientRouter);

mongoose.connect(process.env.DB_URL )
.then(()=>{console.log("connected to database")})
.catch((err)=>{console.log(err)});

app.listen(port,()=>{console.log(`server is running on port ${port}`);});
