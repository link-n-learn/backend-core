const express  = require("express")
const formidable = require("formidable")
const {authenticateRequest} = require("../Middleware/auth");
const User = require("../Models/User");
const { imageUpload, deleteImage } = require("../Utils/uploader");

const router = express.Router();

router.get("/" , authenticateRequest , async(req , res , next)=>{
    try{
        const response = req.user;
        response.password = undefined;
        response.enrolledCourses = undefined
        return res.status(200).json({userData : response})
    }catch(err){
        next(err)
    }
})

router.put("/profilePic" , authenticateRequest , async (req , res, next)=>{
    try{
        const form = formidable({multiples : false})
        form.parse(req , async(err , fields , files)=>{
            if(err) next(err)
            const user = await User.findById(req.user._id);
            console.log(files)
            await deleteImage(user.image)
            const result = await imageUpload(files?.picture)
            user.image = result.secure_url;
            await user.save()
            return res.status(200).json({msg : "Profile picture changed. It might take a while to reflect"})
        })
    }catch(err){
        next(err)
    }
})

module.exports = router