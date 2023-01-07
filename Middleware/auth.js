const User = require("../Models/User");
const jwt = require('jsonwebtoken')

module.exports.authenticateRequest = async (req , res , next)=>{
    // Get the access token
    const authHeader = req.headers.authorization
    if(!authHeader) return res.status(401).json({err : "Auth header not provided" , errCode : 1})
    const token = authHeader.substring(7, authHeader.length);
       try{
           const tokenData = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
           try{
            const user = await User.findById(tokenData.user_id);
            if(!user) return res.status(404).json({err : "User not found"});
            req.user = user
            next()
           }catch(error){
            next(error)
           }  
       }catch(err){
           return res.status(401).json({err : "Token has expired" , errCode : 2})
       }
}

module.exports.isAccountActive = async(req , res, next)=>{
    if(!req.user.isActive){
        return res.status(400).json({err : "Your account has been deactivated. Contact Us to reactivate"});
    }
    next();
}