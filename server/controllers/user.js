const userModel = require("../models/user");
const patientModel = require("../models/patient");
const doctorModel = require("../models/doctor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {addToBlacklist} = require("../middlewares/auth");
const sendEmail = require("../utils/sendEmail");

//create user (only admin can create any user)
const allowedRoles = ["patient","doctor","admin"];
const createUser = async(req,res)=>{
var savedUser;
try{
    var role = req.body.role;
    if(!role || !allowedRoles.includes(role)){
        return res.status(400).send("role must be one of: patient, doctor, admin");
    }
    var existingUser = await userModel.findOne({email:req.body.email});
    if(existingUser){
        return res.status(400).send("user already exists");
    }
 
    var newUser = new userModel({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        phone:req.body.phone,
        profileImage:req.body.profileImage,
        role:role
    });
    savedUser = await newUser.save();
 
    var profile = null;
    if(role === "patient"){
        profile = await patientModel.create({
            _id:savedUser._id,
            dateOfBirth:req.body.dateOfBirth,
            gender:req.body.gender,
            address:req.body.address,
            preferredPaymentMethod:req.body.preferredPaymentMethod
        });
    }else if (role === "doctor") {
    if (!req.body.specialtyId) {
        throw new Error("specialtyId is required for doctor accounts");
    }
    const appointmentDurationMinutes = Number(req.body.appointmentDurationMinutes);
    if (!Number.isFinite(appointmentDurationMinutes) || appointmentDurationMinutes < 5) {
        throw new Error("appointmentDurationMinutes is required for doctor accounts");
    }
    profile = await doctorModel.create({
        userId: savedUser._id,
        bio: req.body.bio,
        experienceYears: req.body.experienceYears,
        specialtyId: req.body.specialtyId,
        appointmentDurationMinutes
    });
    }
 
    return res.status(200).json({user:savedUser, profile});
}catch(err){
    if(savedUser){
        await userModel.findByIdAndDelete(savedUser._id);
    }
    return res.status(500).send(err.message);
}};
//
//login
const login = async(req,res)=>{
try{
    var user = await userModel.findOne({email:req.body.email});
    if(!user){
        return res.status(404).send("user not found");
    }
    var isMatch = await bcrypt.compare(req.body.password, user.password);
    if(!isMatch){
        return res.status(400).send("email or password is incorrect");
    }
    var token = jwt.sign(
        {id:user._id, role:user.role},
        process.env.JWT_SECRET || "mySecretKey",
        {expiresIn:"1d"}
    );
    return res.status(200).json({
        token,
        user:{id:user._id, name:user.name, email:user.email, role:user.role}
    });
}catch(err){
    return res.status(500).send(err.message);
}};
//

//logout
const logout = async(req,res)=>{
try{
    await addToBlacklist(req.token);
    return res.status(200).send("logged out successfully");
}catch(err){
    return res.status(500).send(err.message);
}};
//

//get my profile as a doctor or a patient 
const getMe = async(req,res)=>{
try{
    var user = await userModel.findById(req.user.id).select("-password");
    if(!user){
        return res.status(404).send("user not found");
    }
    var profile = null;
    if(user.role === "patient"){
        profile = await patientModel.findOne(user._id).populate("favoriteDoctors");
    }else if(user.role === "doctor"){
        profile = await doctorModel.findOne(user._id)
            .populate("specialtyId")
            .populate("clinics.clinicId");
    }
    return res.status(200).json({user, profile});
}catch(err){
    return res.status(500).send(err.message);
}};

// update me for updating basic info(name,phone,profile image)
const updateMe = async(req,res)=>{
try{
    var updated = await userModel.findByIdAndUpdate(
        req.user.id,
        {name:req.body.name, phone:req.body.phone, profileImage:req.body.profileImage},
        {new:true, runValidators:true}
    ).select("-password");
    return res.status(200).json(updated);
}catch(err){
    return res.status(500).send(err.message);
}};
//
//update password (user is already in)
const updatePassword = async(req,res)=>{
try{
    var user = await userModel.findById(req.user.id);
    if(!user){
        return res.status(404).send("user not found");
    }
    var isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
    if(!isMatch){
        return res.status(400).send("old password is incorrect");
    }
    if(!req.body.newPassword){
        return res.status(400).send("new password is required");
    }
    user.password = req.body.newPassword;
    await user.save();
    return res.status(200).send("password updated successfully");
}catch(err){
    return res.status(500).send(err.message);
}};
//

//----------------- forget password -----------------
const forgetPassword = async(req,res)=>{
try{
    var user = await userModel.findOne({email:req.body.email});
    if(!user){
        return res.status(404).send("user not found");
    }
    var resetToken = crypto.randomBytes(32).toString("hex");
    var hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
 
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10*60*1000; // 10 دقايق
    await user.save();
 
    // الرابط اللي هيتبعت لليوزر، بيودي على صفحة "reset password" في الفرونت إند
    // مع التوكن الأصلي (الغير مشفر) عشان اليوزر يقدر يستخدمه
    var resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
 
    var html = `
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Click the link below to continue (valid for 10 minutes):</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
    `;
 
    try{
        await sendEmail({
            to:user.email,
            subject:"Password Reset Request",
            html:html
        });
    }catch(emailErr){
        // لو فشل إرسال الإيميل، لازم نمسح التوكن اللي حفظناه عشان مايفضلش صالح من غير ما اليوزر يعرفه
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        console.log("send email error:", emailErr.message);
        return res.status(500).send("failed to send reset email, please try again later");
    }
 
    return res.status(200).send("password reset email sent successfully, please check your inbox");
}catch(err){
    return res.status(500).send(err.message);
}};
 
//----------------- reset password -----------------
const resetPassword = async(req,res)=>{
try{
    var hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    var user = await userModel.findOne({
        resetPasswordToken:hashedToken,
        resetPasswordExpire:{$gt:Date.now()}
    });
    if(!user){
        return res.status(400).send("token is invalid or expired");
    }
    if(!req.body.newPassword){
        return res.status(400).send("newPassword is required");
    }
    user.password = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.status(200).send("password reset successfully");
}catch(err){
    return res.status(500).send(err.message);
}};


// //forget password
// const forgetPassword = async(req,res)=>{
// try{
//     var user = await userModel.findOne({email:req.body.email});
//     if(!user){
//         return res.status(404).send("user not found");
//     }
//     var resetToken = crypto.randomBytes(32).toString("hex");
//     var hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

//     user.resetPasswordToken = hashedToken;
//     user.resetPasswordExpire = Date.now() + 10*60*1000;
//     await user.save();
//     return res.status(200).json({
//         message:"reset token generated. in production this must be sent via email, not returned here",
//         resetToken
//     });
// }catch(err){
//     return res.status(500).send(err.message);
// }};

// //reset password
// const resetPassword = async(req,res)=>{
// try{
//     var hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
//     var user = await userModel.findOne({
//         resetPasswordToken:hashedToken,
//         resetPasswordExpire:{$gt:Date.now()}
//     });
//     if(!user){
//         return res.status(400).send("token is invalid or expired");
//     }
//     if(!req.body.newPassword){
//         return res.status(400).send("newPassword is required");
//     }
//     user.password = req.body.newPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save();
//     return res.status(200).send("password reset successfully");
// }catch(err){
//     return res.status(500).send(err.message);
// }};


module.exports = {
    login,
    logout,
    getMe,
    updateMe,
    forgetPassword,
    resetPassword,
    updatePassword,
    createUser
};
//
