const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
    {
        patientId:{type:mongoose.Schema.Types.ObjectId, ref:"patient", required:true},
        doctorId:{type:mongoose.Schema.Types.ObjectId, ref:"doctor", required:true},
        appointmentId:{type:mongoose.Schema.Types.ObjectId, ref:"appointment"},

        diagnosis:{type:String, required:[true,"diagnosis is required"]},
        symptoms:{type:String},
        notes:{type:String},
        attachments:[{type:String}],
        visitDate:{type:Date, default:Date.now}
    },
    {timestamps:true}
);

var medicalRecordModel = mongoose.model("medicalRecord", medicalRecordSchema);
module.exports = medicalRecordModel;
//