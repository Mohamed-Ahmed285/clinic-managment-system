const userModel = require("../models/user");
const patientModel = require("../models/patient");
const doctorModel = require("../models/doctor");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {addToBlacklist} = require("../middlewares/auth");
const sendEmail = require("../utils/sendEmail");
const { updateMyProfileService } = require("../services/userServices");


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
    }else if(role === "doctor"){
        // specialtyId مطلوبة في موديل الدكتور
        if(!req.body.specialtyId){
            throw new Error("specialtyId is required for doctor accounts");
        }
        profile = await doctorModel.create({
            _id:savedUser._id,
            bio:req.body.bio,
            experienceYears:req.body.experienceYears,
            specialtyId:req.body.specialtyId
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
// const updateMe = async (req, res) => {
//     try {
//         // Pass the required data to the service layer
//         const updated = await updateMyProfileService(
//             req.user.id,
//             req.body,
//             req.file
//         );

//         return res.status(200).json(updated);
//     } catch (err) {
//         return res.status(500).send(err.message);
//     }
// };
// ----------------
const updateMe = async (req, res) => {
    try {
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        // Fallback to an empty object if req.body is undefined
        const body = req.body || {}; 
        
        // Dynamically build the update object so we don't overwrite with undefined
        let updateData = {};
        if (body.name) updateData.name = body.name;
        if (body.phone) updateData.phone = body.phone;

        // If Multer processed an image, grab the secure Cloudinary URL
        if (req.file) {
            updateData.profileImage = req.file.path; 
        } 
        // Fallback: if a string URL was provided instead of a file
        else if (body.profileImage) {
            updateData.profileImage = body.profileImage;
        }

        var updated = await userModel.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json(updated);
    }catch(err){
        return res.status(500).send(err.message);
    }
};
// ----------
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
    var resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
 
  var html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Password Reset</title>
  </head>
  <body style="font-family: 'Fraunces', Georgia, serif; background-color: #F4FCFC; margin: 0; padding: 40px 20px;">
    
    <!-- Main Email Container -->
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <tr>
        <td style="background-color: #04585c; padding: 30px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset Request</h2>
        </td>
      </tr>
      
      <!-- Body Content -->
      <tr>
        <td style="padding: 40px 30px;">
          <p style="font-size: 16px; color: #333333; margin-top: 0; margin-bottom: 20px;">Hi ${user.name},</p>
          
          <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset your password. Click the button below to securely choose a new one. This link is valid for <strong>10 minutes</strong>.
          </p>
          
          <!-- Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetUrl}" style="background-color: #04585c; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <!-- Fallback Link -->
          <p style="font-size: 14px; color: #777777; margin-bottom: 5px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; margin-bottom: 30px; word-break: break-all;">
            <a href="${resetUrl}" style="color: #0d6efd;">${resetUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0 0 20px 0;">
          
          <!-- Footer Note -->
          <p style="font-size: 13px; color: #999999; text-align: center; margin: 0; line-height: 1.5;">
            If you didn't request a password reset, you can safely ignore this email. Your account remains secure and your password will not change.
          </p>
        </td>
      </tr>
    </table>

  </body>
  </html>
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
    forgetPassword,
    resetPassword,
    updateMe,
    updatePassword,
    createUser
}

//
