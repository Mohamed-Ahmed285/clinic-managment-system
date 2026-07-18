const express = require("express");
const router = express.Router();
const {
    register,
    login,
    logout,
    getMe,
    updateMe,
    forgetPassword,
    resetPassword,
    updatePassword
} = require("../controllers/user");
const {verifyToken} = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");


router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);
router.post("/forgetPassword", forgetPassword);
router.put("/resetPassword/:token", resetPassword);
router.put("/updatePassword", verifyToken, updatePassword);
 
 
module.exports = router;
