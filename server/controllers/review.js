const mongoose = require("mongoose");
const reviewModel = require("../models/review");
const appointmentModel = require("../models/appointment");
const patientModel = require("../models/patient");

// ========================
// Review Controller
// ========================

// Create Review
const createReview = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.body.appointmentId)) {
            return res.status(400).send("invalid appointment id");
        }

        var patient = await patientModel.findOne({ userId: req.user.id });

        if (!patient) {
            return res.status(404).send("patient profile not found");
        }

        var appointment = await appointmentModel.findById(req.body.appointmentId);

        if (!appointment) {
            return res.status(404).send("appointment not found");
        }

        if (appointment.patientId.toString() !== patient._id.toString()) {
            return res.status(403).send("you cannot review this appointment");
        }

        if (appointment.status !== "completed") {
            return res.status(400).send("you can only review completed appointments");
        }

        var existingReview = await reviewModel.findOne({
            appointmentId: appointment._id
        });

        if (existingReview) {
            return res.status(400).send("review already exists for this appointment");
        }

        if (req.body.rating === undefined) {
            return res.status(400).send("rating is required");
        }

        if (req.body.rating < 1 || req.body.rating > 5) {
            return res.status(400).send("rating must be between 1 and 5");
        }

        var review = await reviewModel.create({
            patientId: patient._id,
            doctorId: appointment.doctorId,
            appointmentId: appointment._id,
            rating: req.body.rating,
            comment: req.body.comment
        });

        return res.status(201).json({
            message: "review created successfully",
            review
        });

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// Get Doctor Reviews
const getDoctorReviews = async (req, res) => {
    try {

        var reviews = await reviewModel.find({
            doctorId: req.params.doctorId
        }).populate({
            path: "patientId",
            populate: {
                path: "userId",
                select: "name profileImage"
            }
        });

        return res.status(200).json(reviews);

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// Get My Reviews
const getMyReviews = async (req, res) => {
    try {

        var patient = await patientModel.findOne({
            userId: req.user.id
        });

        if (!patient) {
            return res.status(404).send("patient profile not found");
        }

        var reviews = await reviewModel.find({
            patientId: patient._id
        }).populate({
            path: "doctorId",
            populate: [
                {
                    path: "userId",
                    select: "name profileImage"
                },
                {
                    path: "specialtyId"
                }
            ]
        });

        return res.status(200).json(reviews);

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// Update Review
const updateReview = async (req, res) => {
    try {

        var patient = await patientModel.findOne({
            userId: req.user.id
        });

        if (!patient) {
            return res.status(404).send("patient profile not found");
        }

        var review = await reviewModel.findById(req.params.id);

        if (!review) {
            return res.status(404).send("review not found");
        }

        if (review.patientId.toString() !== patient._id.toString()) {
            return res.status(403).send("you cannot update this review");
        }

        if (req.body.rating !== undefined) {
            if (req.body.rating < 1 || req.body.rating > 5) {
                return res.status(400).send("rating must be between 1 and 5");
            }

            review.rating = req.body.rating;
        }

        if (req.body.comment !== undefined) {
            review.comment = req.body.comment;
        }

        await review.save();

        return res.status(200).json({
            message: "review updated successfully",
            review
        });

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// Delete Review
const deleteReview = async (req, res) => {
    try {

        var patient = await patientModel.findOne({
            userId: req.user.id
        });

        if (!patient) {
            return res.status(404).send("patient profile not found");
        }

        var review = await reviewModel.findById(req.params.id);

        if (!review) {
            return res.status(404).send("review not found");
        }

        if (review.patientId.toString() !== patient._id.toString()) {
            return res.status(403).send("you cannot delete this review");
        }

        await reviewModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "review deleted successfully"
        });

    } catch (err) {
        return res.status(500).send(err.message);
    }
};

module.exports = {
    createReview,
    getDoctorReviews,
    getMyReviews,
    updateReview,
    deleteReview
};