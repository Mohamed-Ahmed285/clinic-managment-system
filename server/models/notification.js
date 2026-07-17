const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipientId:{type:mongoose.Schema.Types.ObjectId, required:true}, 
        recipientType:{type:String, enum:["patient","doctor"], required:true},

        title:{type:String, required:true},
        message:{type:String, required:true},

        type:{
            type:String,
            enum:["appointmentBooked","appointmentCancelled","appointmentReminder","reviewReceived","system","MedicalReminder"],
            default:"system"
        },

        relatedAppointmentId:{type:mongoose.Schema.Types.ObjectId, ref:"appointment"},

        isRead:{type:Boolean, default:false}
    },
    {timestamps:true}
);

var notificationModel = mongoose.model("notification", notificationSchema);
module.exports = notificationModel;
//