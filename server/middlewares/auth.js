const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/tokenBlacklist");

const extractToken = (req)=>{
    var token = req.headers["token"] || req.headers["authorization"];
    if(token && token.startsWith("Bearer ")){
        token = token.slice(7);
    }
    return token;
};

const addToBlacklist = async(token)=>{
    if(!token) return;
    try{
        var decoded = jwt.decode(token);
        var expireAt = (decoded && decoded.exp)
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 24*60*60*1000);
        await tokenBlacklistModel.create({token, expireAt});
    }catch(err){
        console.log("blacklist add error:", err.message);
    }
};

const verifyToken = async(req,res,next)=>{
    var token = extractToken(req);
    if(!token){
        return res.status(401).json("access denied, no token provided");
    }
    try{
        var blacklisted = await tokenBlacklistModel.findOne({token});
        if(blacklisted){
            return res.status(401).json("token is no longer valid, please login again");
        }
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        req.token = token;
        next();
    }catch(err){
        return res.status(401).json("invalid or expired token");
    }
};

// // دالة عامة بتسمح بأدوار معينة بس
// const allowRoles = (...roles)=>{
//     return (req,res,next)=>{
//         if(!req.user || !roles.includes(req.user.role)){
//             return res.status(403).send(`access denied, allowed roles: ${roles.join(", ")}`);
//         }
//         next();
//     };
// };
// const isAdmin = allowRoles("admin");
// const isDoctor = allowRoles("doctor");
// const isPatient = allowRoles("patient");

module.exports = {verifyToken, addToBlacklist};
