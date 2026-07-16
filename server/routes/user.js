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
    updatePassword,
    createUser
} = require("../controllers/user");
const {verifyToken, isAdmin} = require("../middlewares/auth");
 


router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);
router.post("/forgetPassword", forgetPassword);
router.put("/resetPassword/:token", resetPassword);
router.put("/updatePassword", verifyToken, updatePassword);
router.post("/createUser", verifyToken, isAdmin, createUser);
 
 
module.exports = router;
