const userModel = require("../models/user");

const updateMyProfileService = async (userId, bodyData, fileData) => {
    // Construct the update object dynamically
    let updateData = {
        name: bodyData.name,
        phone: bodyData.phone
    };

    if (fileData) {
        updateData.profileImage = fileData.path; 
    } 
    else if (bodyData.profileImage) {
        updateData.profileImage = bodyData.profileImage;
    }

    const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
    ).select("-password");

    return updatedUser;
};



module.exports = {
    updateMyProfileService
};