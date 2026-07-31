const express = require("express");
const upload = require("../middlewares/upload");
const router = express.Router();
const {
    register,
    login,
    logout,
    getMe,
    updateMe,
    forgetPassword,
    resetPassword,
    verifyEmail,
    updatePassword,
    createUser
} = require("../controllers/user");
const {verifyToken} = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");


router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, upload.single("profileImage"), updateMe);
router.post("/forgetPassword", forgetPassword);
router.put("/resetPassword/:token", resetPassword);
router.get("/verifyEmail/:token", verifyEmail);
router.put("/updatePassword", verifyToken, updatePassword);
router.post("/createUser",verifyToken,authorize("user:create"),createUser);

 
module.exports = router;
