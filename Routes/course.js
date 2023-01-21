const express = require('express');
const { authenticateRequest, isAdmin, isAccountActive } = require('../Middleware/auth');
const Category = require('../Models/Category');
const Course = require('../Models/Course');
const router = express.Router();

router.post('/details'  , authenticateRequest , isAccountActive, async (req , res , next)=>{
    try{
        const {title , descp , categoryId} = req.body;
        if(!title || !descp || !categoryId) return res.status(400).json({err : "Required parameters missing"});
        req.body.owner = req.user;
        const newCourse = await Course.create(req.body);
        return res.status(200).json({msg : "Course Details has been created" , newCourse});
    }catch(err){
        next(err)
    }
})

router.get("/details/:courseId" , authenticateRequest , isAccountActive,  async(req , res , next)=>{
    try{
        const foundCourse = await Course.findById(req.params.courseId);
        if(!foundCourse) return res.status(404).json({err : "Requested resourse is not found"});
        //check if the logged in user can access this resource
        if(foundCourse.owner != req.user._id) return res.status(403).json({err : "You are not allowed to view this resource"});
        return res.status(200).json({foundCourse});
    }catch(err){
        next(err)
    }
})

router.put("/details/:courseId"  , authenticateRequest , isAccountActive, async(req , res , next)=>{
    try{
        const foundCourse = await Course.findById(req.params.courseId);
        if(!foundCourse) return res.status(404).json({err : "Requested resource is not found"});
        if(foundCourse.owner != req.user._id) return res.status(403).json({err : "You are not allowed to perform this operation"});
        const updatedCourse =await Course.findByIdAndUpdate(req.params.courseId , req.body);
        return res.status(200).json({msg : "The course has been updated" , updatedCourse});
    }catch(err){
        next(err)
    }
})

//TODO DELETE COURSE

router.post('/category/' , authenticateRequest , isAdmin , isAccountActive,  async(req , res ,next)=>{
    try{
        const newCategory = await Category.create(req.body);
        return res.status(200).json({msg : "Category created Successfully" , newCategory});
    }catch(err){
        next(err)
    }
})

router.get('/category/', async(req , res ,next)=>{
    try{
        const categories = await Category.find({});
        return res.status(200).json({categories});
    }catch(err){
        next(err)
    }
})

// TODO : CATEGORY UPDATE AND DELETE
module.exports = router;