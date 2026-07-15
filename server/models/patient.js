const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const patientSchema = new mongoose.Schema(
    {
        name:{type:String, required:[true,"name is required"],
            minLength:[3,"minlength is 3"],
            maxLength:[50,"maxlength is 50"]},
        email:{type:String, required:[true,"email is required"], unique:true, lowercase:true, trim:true},
        password:{type:String, required:[true,"password is required"],
            minLength:[8,"minlength is 8"]},
        role:{type:String, default:"patient", enum:["patient"]},
        phone:{type:String},
        profileImage:{type:String}, 
        dateOfBirth:{type:Date},
        gender:{type:String, enum:["male","female"]},
        address:{
            city:{type:String},
            state:{type:String},
            country:{type:String}
        },
        favoriteDoctors:[{type:mongoose.Schema.Types.ObjectId, ref:"doctor"}],
        preferredPaymentMethod:{type:String, enum:["online","cash"], default:"cash"},
        insurance:{
            companyId:{type:mongoose.Schema.Types.ObjectId, ref:"insuranceCompany"},
            planId:{type:mongoose.Schema.Types.ObjectId, ref:"insurancePlan"}
        },
        notificationsEnabled:{type:Boolean, default:true}
    },
    {timestamps:true}
);

// hash password
patientSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return;
    }
    var salt = await bcrypt.genSalt(15);
    var hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
});

var patientModel = mongoose.model("patient", patientSchema);
module.exports = patientModel;
//