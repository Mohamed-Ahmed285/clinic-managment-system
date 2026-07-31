const patientModel = require("../models/patient");
const doctorModel = require("../models/doctor");
const userModel = require("../models/user");
const todoModel = require("../models/todo");
const sendEmail = require("../utils/sendEmail");

//register only forr patient 
const register = async(req,res)=>{
var savedUser;
try{
    const email = req.body.email?.toLowerCase().trim();
    var existingUser = await userModel.findOne({ email });
    if(existingUser){
        return res.status(400).json({ message: "User already exists" });
    }

    var newUser = new userModel({
        name:req.body.name,
        email,
        password:req.body.password,
        phone:req.body.phone,
        profileImage:req.body.profileImage,
        role:"patient"
    });
    savedUser = await newUser.save();

    var profile = await patientModel.create({
        _id: savedUser._id,
        dateOfBirth:req.body.dateOfBirth,
        gender:req.body.gender,
        address:req.body.address,
        preferredPaymentMethod:req.body.preferredPaymentMethod
    });

    const { password, ...userWithoutPassword } = savedUser.toObject();

    // Registration itself already succeeded at this point, so a failed
    // confirmation email should never fail the signup response - just log it.
    try{
        const loginUrl = `${process.env.FRONTEND_URL}/auth/login`;
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to NoQ</title>
        </head>
        <body style="font-family: 'Fraunces', Georgia, serif; background-color: #F4FCFC; margin: 0; padding: 40px 20px;">

          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">

            <!-- Header -->
            <tr>
              <td style="background-color: #04585c; padding: 30px; text-align: center;">
                <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to NoQ, ${savedUser.name}!</h2>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #333333; margin-top: 0; margin-bottom: 20px;">Hi ${savedUser.name},</p>

                <p style="font-size: 16px; color: #555555; line-height: 1.6; margin-bottom: 30px;">
                  Your account has been created successfully with the email <strong>${savedUser.email}</strong>. You can now book appointments, track your visits, and manage your care, all in one place.
                </p>

                <!-- Button -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <a href="${loginUrl}" style="background-color: #04585c; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Log In to Your Account</a>
                </div>

                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 0 0 20px 0;">

                <!-- Footer Note -->
                <p style="font-size: 13px; color: #999999; text-align: center; margin: 0; line-height: 1.5;">
                  If you didn't create this account, please contact us at <a href="mailto:noq.supportteam@gmail.com" style="color: #04585c;">noq.supportteam@gmail.com</a>.
                </p>
              </td>
            </tr>
          </table>

        </body>
        </html>
        `;

        await sendEmail({
            to: savedUser.email,
            subject: "Welcome to NoQ - Registration Confirmed",
            html: html
        });
    }catch(emailErr){
        console.log("registration confirmation email error:", emailErr.message);
    }

    return res.status(200).json({ user: userWithoutPassword, profile });
}catch(err){
    if(savedUser){
        await userModel.findByIdAndDelete(savedUser._id);
    }
    if(err.name === "ValidationError"){
        return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: err.message });
}};
//


// Update patient profile (User + Patient)
const updateMyProfile = async (req, res) => {
    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                name: req.body.name,
                phone: req.body.phone,
                profileImage: req.body.profileImage
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        const updatedPatient = await patientModel.findByIdAndUpdate(
            req.user.id,
            {
                dateOfBirth: req.body.dateOfBirth,
                gender: req.body.gender,
                address: req.body.address,
                preferredPaymentMethod: req.body.preferredPaymentMethod,
                notificationsEnabled: req.body.notificationsEnabled
            },
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).send("Patient profile not found");
        }

        return res.status(200).json({
            user: updatedUser,
            profile: updatedPatient
        });

    } catch (err) {
        return res.status(500).send(err.message);
    }
};


//patient saves their favorite doctors
const addFavoriteDoctor = async(req,res)=>{
try{
    var doctorExists = await doctorModel.findById(req.params.doctorId);
    if(!doctorExists){
        return res.status(404).send("doctor not found");
    }
    var patient = await patientModel.findByIdAndUpdate(
        req.user.id,
        {$addToSet:{favoriteDoctors:req.params.doctorId}},
        {new:true}
    );
    if(!patient){
        return res.status(404).send("patient profile not found");
    }
    return res.status(200).json(patient);
}catch(err){
    return res.status(500).send(err.message);
}};
//
//remove doctor from favorites
const removeFavoriteDoctor = async(req,res)=>{
try{
    var patient = await patientModel.findByIdAndUpdate(
        req.user.id,
        {$pull:{favoriteDoctors:req.params.doctorId}},
        {new:true}
    );
    if(!patient){
        return res.status(404).send("patient profile not found");
    }
    return res.status(200).json(patient);
}catch(err){
    return res.status(500).send(err.message);
}};
//
//patient gets all favorite doctors
const getMyFavorites = async(req,res)=>{
try{
    var patient = await patientModel.findById(req.user.id).populate({
        path:"favoriteDoctors",
        populate:[
            {path:"_id", select:"name email phone profileImage"},
            {path:"specialtyId"}
        ]
    });
    if(!patient){
        return res.status(404).send("patient profile not found");
    }
    return res.status(200).json(patient.favoriteDoctors);
}catch(err){
    return res.status(500).send(err.message);
}};
//
// get todos for the current patient
const getMyTodos = async (req, res) => {
    try {
        const patient = await patientModel.findById(req.user.id);
        if (!patient) return res.status(404).send("patient profile not found");

        const todos = await todoModel.find({ _id: patient._id }).sort({ createdAt: -1 });
        return res.status(200).json(todos);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};


module.exports = {
    register,
    updateMyProfile,
    addFavoriteDoctor,
    removeFavoriteDoctor,
    getMyFavorites,
    getMyTodos
};