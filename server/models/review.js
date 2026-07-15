const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        patientId:{type:mongoose.Schema.Types.ObjectId, ref:"patient", required:true},
        doctorId:{type:mongoose.Schema.Types.ObjectId, ref:"doctor", required:true},
        appointmentId:{type:mongoose.Schema.Types.ObjectId, ref:"appointment", required:true, unique:true}, 

        rating:{type:Number, required:true, min:1, max:5},
        comment:{type:String, maxLength:500}
    },
    {timestamps:true}
);

var reviewModel = mongoose.model("review", reviewSchema);
module.exports = reviewModel;
//