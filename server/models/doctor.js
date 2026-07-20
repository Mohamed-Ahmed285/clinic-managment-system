const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const workingHourSchema = new mongoose.Schema(
    {
        day:[{type:String,
            enum:["saturday","sunday","monday","tuesday","wednesday","thursday","friday"],
            required:true}],
        startTime:{type:String, required:true}, 
        endTime:{type:String, required:true}    
    },
    {_id:false}
);

const clinicAssignmentSchema = new mongoose.Schema(
    {
        clinicId:{type:mongoose.Schema.Types.ObjectId, ref:"clinic", required:true},
        consultationFee:{type:Number, required:true, min:0},
        availability:[workingHourSchema],
        isActiveAtClinic:{type:Boolean, default:true}
    },
    {_id:false}
);

const doctorSchema = new mongoose.Schema(
    {
        _id:{type:mongoose.Schema.Types.ObjectId, ref:"user"},
        bio:{type:String, maxLength:1000},
        experienceYears:{type:Number, min:0, default:0},
        specialtyId:{type:mongoose.Schema.Types.ObjectId, ref:"specialty", required:true},
        appointmentDurationMinutes:{type:Number, required:true, default:15,min:5},
        clinics:[clinicAssignmentSchema],
        rating:{
            average:{type:Number, default:0, min:0, max:5},
            count:{type:Number, default:0}
        },
        bookingStats:{
            totalAppointments:{type:Number, default:0},
            completedAppointments:{type:Number, default:0},
            cancelledAppointments:{type:Number, default:0}
        }
    },
    {timestamps:true}
);

var doctorModel = mongoose.model("doctor", doctorSchema);
module.exports = doctorModel;
//
