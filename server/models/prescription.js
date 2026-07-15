const mongoose = require("mongoose");


const medicationSchema = new mongoose.Schema(
    {
        name:{type:String, required:true},
        dosage:{type:String, required:true},
        frequency:{type:String, required:true}, 
        duration:{type:String},         
        notes:{type:String}
    },
    {_id:false}
);

const prescriptionSchema = new mongoose.Schema(
    {
        patientId:{type:mongoose.Schema.Types.ObjectId, ref:"patient", required:true},
        doctorId:{type:mongoose.Schema.Types.ObjectId, ref:"doctor", required:true},
        appointmentId:{type:mongoose.Schema.Types.ObjectId, ref:"appointment", required:true},

        medications:[medicationSchema],
        generalNotes:{type:String},

        issuedDate:{type:Date, default:Date.now}
    },
    {timestamps:true}
);

var prescriptionModel = mongoose.model("prescription", prescriptionSchema);
module.exports = prescriptionModel;
//