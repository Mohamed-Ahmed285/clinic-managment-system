const express = require("express");
const router = express.Router();

const {
    createReview,
    getDoctorReviews,
    getMyReviews,
    updateReview,
    deleteReview
} = require("../controllers/review");

const {
    verifyToken,
    isPatient
} = require("../middlewares/auth");

router.post("/", verifyToken, isPatient, createReview);

router.get("/doctor/:doctorId", getDoctorReviews);

router.get("/my", verifyToken, isPatient, getMyReviews);

router.put("/:id", verifyToken, isPatient, updateReview);

router.delete("/:id", verifyToken, isPatient, deleteReview);

module.exports = router;