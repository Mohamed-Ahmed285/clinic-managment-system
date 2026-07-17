const express = require("express");
const router = express.Router();
const {
    register,
    updateMyProfile,
    addFavoriteDoctor,
    removeFavoriteDoctor,
    getMyFavorites
    ,getMyTodos
} = require("../controllers/patient");
const {verifyToken,} = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");


router.post("/register", register);
router.put("/updateMyProfile", verifyToken, authorize("profile:update"), updateMyProfile);
router.post("/favorites/:doctorId", verifyToken, authorize("favorite:create"), addFavoriteDoctor);
router.delete("/favorites/:doctorId", verifyToken, authorize("favorite:delete"), removeFavoriteDoctor);
router.get("/favorites", verifyToken, authorize("favorite:read"), getMyFavorites);
router.get("/todos", verifyToken, authorize("todo:read"), getMyTodos);

module.exports = router;