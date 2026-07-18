const express = require("express");
const router = express.Router();

const {
    createReview,
    getDoctorReviews,
    getMyReviews,
    updateReview,
    deleteReview
} = require("../controllers/review");

const { verifyToken } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

router.post("/", verifyToken, authorize("review:create"), createReview);

router.get("/doctor/:doctorId", getDoctorReviews);

router.get("/my", verifyToken, authorize("review:read"), getMyReviews);

router.put("/:id", verifyToken, authorize("review:update"), updateReview);

router.delete("/:id", verifyToken, authorize("review:delete"), deleteReview);

module.exports = router;