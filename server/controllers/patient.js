const patientModel = require("../models/patient");
const doctorModel = require("../models/doctor");
const userModel = require("../models/user");

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
        userId:savedUser._id,
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

//update patient profile 
//to update all data of patient let your frontend send one form and fire both requests together
const updateMyProfile = async(req,res)=>{
try{
    var updated = await patientModel.findOneAndUpdate(
        {userId:req.user.id},
        {
            dateOfBirth:req.body.dateOfBirth,
            gender:req.body.gender,
            address:req.body.address,
            preferredPaymentMethod:req.body.preferredPaymentMethod,
            notificationsEnabled:req.body.notificationsEnabled
        },
        {new:true, runValidators:true}
    );
    if(!updated){
        return res.status(404).send("patient profile not found");
    }
    return res.status(200).json(updated);
}catch(err){
    return res.status(500).send(err.message);
}};

//patient saves their favorite doctors
const addFavoriteDoctor = async(req,res)=>{
try{
    var doctorExists = await doctorModel.findById(req.params.doctorId);
    if(!doctorExists){
        return res.status(404).send("doctor not found");
    }
    var patient = await patientModel.findOneAndUpdate(
        {userId:req.user.id},
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
    var patient = await patientModel.findOneAndUpdate(
        {userId:req.user.id},
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
    var patient = await patientModel.findOne({userId:req.user.id}).populate({
        path:"favoriteDoctors",
        populate:[
            {path:"userId", select:"name email phone profileImage"},
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


module.exports = {
    register,
    updateMyProfile,
    addFavoriteDoctor,
    removeFavoriteDoctor,
    getMyFavorites
};
