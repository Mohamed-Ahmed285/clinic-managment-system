const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const patientSchema = new mongoose.Schema(
    { 
        userId:{type:mongoose.Schema.Types.ObjectId, ref:"user", required:true, unique:true},
        dateOfBirth:{type:Date},
        gender:{type:String, enum:["male","female"]},
        address:{
            city:{type:String},
            state:{type:String},
            country:{type:String}
        },
        favoriteDoctors:[{type:mongoose.Schema.Types.ObjectId, ref:"doctor"}],
        preferredPaymentMethod:{type:String, enum:["online","cash"], default:"cash"},
        notificationsEnabled:{type:Boolean, default:true}
    },
    {timestamps:true}
);

var patientModel = mongoose.model("patient", patientSchema);
module.exports = patientModel;
//
