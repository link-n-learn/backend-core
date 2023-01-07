const User = require('../Models/User')

module.exports.validateSignup = async (req, res , next)=>{
    try{
        let {username , email , password } = req.body
        if(!username || !email || !password) return res.status(400).json({err : "required fields missing"})
        // Check if email is taken
        const existingUser = await User.findOne({
            email
        })
        console.log(existingUser)
        if(existingUser) return res.status(409).json({err : "Email is already taken"})
        next()
    }catch(err){
        next(err)
    }
}