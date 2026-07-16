const express = require("express");
const router = express.Router();
const {
    register,
    updateMyProfile,
    addFavoriteDoctor,
    removeFavoriteDoctor,
    getMyFavorites
} = require("../controllers/patient");
const {verifyToken, isPatient, isAdmin} = require("../middlewares/auth");
 
router.post("/register", register);
router.put("/updateMyProfile", verifyToken, isPatient, updateMyProfile);
router.post("/favorites/:doctorId", verifyToken, isPatient, addFavoriteDoctor);
router.delete("/favorites/:doctorId", verifyToken, isPatient, removeFavoriteDoctor);
router.get("/favorites", verifyToken, isPatient, getMyFavorites);

module.exports = router;