const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        name:{type:String, required:[true,"name is required"],
            minLength:[3,"minlength is 3"],
            maxLength:[50,"maxlength is 50"]},
        email:{type:String, required:[true,"email is required"], unique:true, lowercase:true, trim:true},
        password:{type:String, required:[true,"password is required"], minLength:[8,"minlength is 8"]},
        phone:{type:String},
        profileImage:{type:String},
        role:{type:String, required:true, enum:["patient","doctor","admin"]}
    },
    {timestamps:true}
);

// hash password 
userSchema.pre("save", async function(){
    if(!this.isModified("password")){
        return;
    }
    var salt = await bcrypt.genSalt(15);
    var hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
});

var userModel = mongoose.model("user", userSchema);
module.exports = userModel;
//
