const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
dotenv.config();

connectDB();