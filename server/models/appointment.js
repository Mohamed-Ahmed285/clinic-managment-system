const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        patientId:{type:mongoose.Schema.Types.ObjectId, ref:"patient", required:true},
        doctorId:{type:mongoose.Schema.Types.ObjectId, ref:"doctor", required:true},
        clinicId:{type:mongoose.Schema.Types.ObjectId, ref:"clinic", required:true},
        date:{type:Date, required:true},
        startTime:{type:String, required:true},
        endTime:{type:String},
        durationMinutes:{type:Number, required:true, min:5},
        status:{
            type:String,
            enum:["pending","confirmed","completed","cancelled","rescheduled"],
            default:"pending"
        },
        paymentMethod:{type:String, enum:["online","cash"], required:true},
        paymentStatus:{type:String, enum:["pending","paid","refunded"], default:"pending"},
        fee:{type:Number, required:true, min:0},

        rescheduledFrom:{type:mongoose.Schema.Types.ObjectId, ref:"appointment"},
        cancelledBy:{type:String, enum:["patient","doctor","admin"]},
        cancellationReason:{type:String}
    },
    {timestamps:true}
);

appointmentSchema.index({doctorId:1, clinicId:1, date:1, startTime:1}, {unique:true});

var appointmentModel = mongoose.model("appointment", appointmentSchema);
module.exports = appointmentModel;
//