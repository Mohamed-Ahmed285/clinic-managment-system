const mongoose = require("mongoose");

const specialtySchema = new mongoose.Schema(
    {
        name:{type:String, required:[true,"name is required"], unique:true, trim:true},
        description:{type:String},
        icon:{type:String}
    },
    {timestamps:true}
);

var specialtyModel = mongoose.model("specialty", specialtySchema);
module.exports = specialtyModel;
//