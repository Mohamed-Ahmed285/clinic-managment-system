const patientModel = require("../models/patient");
const doctorModel = require("../models/doctor");
const userModel = require("../models/user");
const todoModel = require("../models/todo");

//register only forr patient 
const register = async(req,res)=>{
var savedUser;
try{
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

    return res.status(200).json({user:savedUser, profile});
}catch(err){
    if(savedUser){
        await userModel.findByIdAndDelete(savedUser._id);
    }
    return res.status(500).send(err.message);
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

        const todos = await todoModel.find({ patientId: patient._id }).sort({ createdAt: -1 });
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
