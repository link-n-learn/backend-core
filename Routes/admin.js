const express = require("express")
const { authenticateRequest, isAdmin } = require("../Middleware/auth")
const User = require("../Models/User")
const Course = require("../Models/Course")
const router = express.Router()

router.get("/users" , authenticateRequest, isAdmin, async(req, res , next)=>{
    try{
        const users = await User.find({})
        console.log(users)
        return res.status(200).json(users)
    }catch(err){
        next(err)
    }
})

router.patch("/users/:userId/disable" , authenticateRequest , isAdmin , async(req , res , next)=>{
    try{
        const user = await User.findById(req.params.userId);
        if(!user) return res.status(404).json({err : "User not found"})
        user.isActive = false;
        await user.save();
        return res.status(200).json({msg : "User disabled"})
    }catch(err){
        next(err)
    }
})

router.patch("/users/:userId/enable" , authenticateRequest , isAdmin , async(req , res , next)=>{
    try{
        const user = await User.findById(req.params.userId);
        if(!user) return res.status(404).json({err : "User not found"})
        user.isActive = true;
        await user.save();
        return res.status(200).json({msg : "User enabled"})
    }catch(err){
        next(err)
    }
})

router.patch("/courses/:courseId/disable" , authenticateRequest , isAdmin , async(req , res , next)=>{
    try{
        const course = await Course.findById(req.params.courseId)
        if(!course) return res.status(404).json({err : "COurse not found"})
        course.isActive = false;
        await course.save();
        console.log(course)
        return res.status(200).json({err : "Course disabled"})
    }catch(err){
        next(err)
    }
})

router.patch("/courses/:courseId/enable" , authenticateRequest , isAdmin , async(req , res , next)=>{
    try{
        const course = await Course.findById(req.params.courseId)
        if(!course) return res.status(404).json({err : "COurse not found"})
        course.isActive = true;
        await course.save();
        return res.status(200).json({err : "Course enabled"})
    }catch(err){
        next(err)
    }
})
module.exports = router
