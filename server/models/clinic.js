const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema(
    {
        name:{type:String, required:[true,"name is required"], trim:true},
        phone:{type:String},
        email:{type:String, lowercase:true, trim:true},
        image:{type:String},
        startHour:{type:String},
        endHour:{type:String},
        
        address:{
            street:{type:String},
            city:{type:String, required:true},
            state:{type:String},
            country:{type:String}
        }
    },
    {timestamps:true}
);

var clinicModel = mongoose.model("clinic", clinicSchema);
module.exports = clinicModel;
//