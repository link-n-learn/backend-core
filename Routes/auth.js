const express = require('express')
const User = require('../Models/User')
const { validateSignup } = require('../Utils/validators')
const otpGenerator = require('otp-generator')
const OTP = require('../Models/OTP')
const bcrypt = require('bcryptjs')
const {sendEmail} = require('../Utils/communication')
const RefreshToken = require('../Models/RefreshToken')
const jwt = require('jsonwebtoken')
const { authenticateRequest, isAccountActive } = require('../Middleware/auth')

const router = express.Router()

const accessTokenExpiryTime = 60 * 20

router.post('/signup' , validateSignup ,  async (req, res , next)=>{
    try{
        // Validated required fields are present and email is not taken

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password= hash;
        const newUser= await User.create(req.body)
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

        await OTP.create({
            otp : otp,
            userId : newUser._id
        })

        // sendmail
        email_msg = {
            to: newUser.email,
            from: 'ganeshdagadi3@gmail.com', // Use the email address or domain you verified with sendgrid
            subject: 'OTP to verify email for Tradilearn',
            html: `<strong>Your OTP to verify email is ${otp}</strong>`,
        }
        await sendEmail(email_msg)
        newUser.password = undefined
        return res.status(200).json({msg : "Enter the OTP sent to your mail and verify your email", user : newUser})
    }catch(err){
        next(err)
    }
})

router.post('/signup/verify' , async (req , res , next)=>{
    try{
        //Verify OTP
        const {otp , userId} = req.body
        if(!otp || !userId) return res.status(400).json({err : "Required params are missing"})
        const foundOTP = await OTP.findOne({userId : userId})
        if(!foundOTP) return res.status(401).json({err : "OTP has expired. Request for resend" , errCode : 11})
        if(foundOTP.otp !== otp) return res.status(401).json({err : "OTP is incorrect. Please retry" , errCode : 12})
        //otp verified. Creating account
        const user = await User.findById(userId)
        
        user.isVerified = true
        user.isActive = true
        await user.save()
        return res.status(200).json({msg : "Your account has been verified. Please Login"})
    }catch(err){
        next(err)
    }
})

router.patch('/signup/resendotp' , async (req , res , next)=>{
    try{
        const {userId} = req.body;
        if(!userId) return res.status(400).json({err : "Required parameters are missing"})
        await OTP.findOneAndDelete({userId : userId})

        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });

        await OTP.create({
            otp : otp,
            userId : userId
        })

        const user = await User.findById(userId)
        if(!user) return res.status(404).json({err : "Requested user not found"})
        // sendmail
        email_msg = {
            to: user.email,
            from: 'ganeshdagadi3@gmail.com', // Use the email address or domain you verified with sendgrid
            subject: 'OTP to verify email for Linked learning',
            html: `<strong>Your OTP to verify email is ${otp}</strong>`,
        }
        await sendEmail(email_msg)
        return res.status(200).json({msg : "OTP sent"})
    }catch(err){
        next(err)
    }
})


router.patch('/login' ,async(req, res , next)=>{
    try{
        const {email , password} = req.body;
        if(!email || !password) return res.status(400).json({err : "Credentials missing"});
        const user = await User.findOne({
            email
        });
        if(!user) return res.status(404).json({err : "User not found"});
        if(!bcrypt.compareSync(password , user.password)) return res.status(403).json({err : "Passwords dont match"})
        const accessToken = jwt.sign({user_id : user._id} , process.env.ACCESS_TOKEN_SECRET , {expiresIn :accessTokenExpiryTime})
        const refreshToken = jwt.sign({user_id : user._id }, process.env.REFRESH_TOKEN_SECRET)
        //setting refresh token in db
        await RefreshToken.create({token : refreshToken})
        user.password= undefined
        res.status(200).json({
            tokens : {
                access : accessToken,
                refresh : refreshToken
            },
            user : user,
            msg : "Logged in successfully"
        })
    }catch(err){
        next(err)
    }
})


router.patch('/newtoken' , async (req, res , next)=>{
    try{
        if(!req.headers.authorization) return res.status(400).json("Provide refresh token in authorization header")
        const authHeader = req.headers.authorization
        if(!authHeader) return res.status(404).json({err : "Auth header not provided"})
        const token = authHeader.substring(7, authHeader.length);
        const dbToken = await RefreshToken.findOne({token})
        if(!dbToken) return res.status(401).json({err : "You are logged out. Please login"})
        //decode token to get user_id
        const tokenData = jwt.verify(token , process.env.REFRESH_TOKEN_SECRET)
        const user_id = tokenData.user_id;

        //generating new access token
        const accessToken = jwt.sign(
            {
                user_id : user_id
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn : accessTokenExpiryTime
            }
        )
        return res.status(200).json({token : accessToken})
    }
    catch(err){
        next(err)
    }
})

router.patch('/logout' , async (req , res , next)=>{
    try{
        if(!req.headers.authorization) return res.status(400).json("Provide refresh token in authorization header")
        const authHeader = req.headers.authorization
        if(!authHeader) return res.status(404).json({err : "Auth header not provided"})
        const token = authHeader.substring(7, authHeader.length);
        const dbToken = await RefreshToken.findOne({
            token
        })
        if(!dbToken) return res.status(400).json({err : "You are already logged out"})
        await RefreshToken.findOneAndDelete({
           token
        })
        res.status(200).json({msg : "Logged out successfully."})
    }catch(err){
        next(err)
    }
})

router.get('/protected' , authenticateRequest , isAccountActive , async (req , res , next)=>{
    return res.status(200).json({msg : "Done"});
})
module.exports = router;