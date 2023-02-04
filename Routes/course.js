const express = require('express');
const { authenticateRequest, isAdmin, isAccountActive } = require('../Middleware/auth');
const Category = require('../Models/Category');
const Course = require('../Models/Course');
const router = express.Router();
const {imageUpload} = require("../Utils/uploader")
const formidable = require('formidable')

router.post('/details'  , authenticateRequest , isAccountActive, async (req , res , next)=>{
    // router.post("/details" , async (req , res , next)=>{
    try{
        const form = formidable({multiples : true})
        form.parse(req , async(err , fields , files)=>{
            if(err) next(err)
            console.log(files)
            const result = await imageUpload(files?.thumbnail)
            fields.image = result.secure_url

            const {title , descp , categoryId} = fields;
            if(!title || !descp || !categoryId) return res.status(400).json({err : "Required parameters missing"});
            fields.owner = req.user;
            // fields.owner = categoryId
            const newCourse = await Course.create(fields);
            return res.status(200).json({msg : "Course Details has been created" , newCourse});
        })        
    }catch(err){
        next(err)
    }
})

router.get("/" , authenticateRequest , isAccountActive , async(req , res , next)=>{
    try{
        const courses = await Course.find({owner : req.user._id});
        return res.status(200).json({courses : courses})
    }catch(err){
        next(err)
    }
})

router.get("/details/:courseId" , authenticateRequest , isAccountActive,  async(req , res , next)=>{
    try{
        const foundCourse = await Course.findById(req.params.courseId);
        if(!foundCourse) return res.status(404).json({err : "Requested resourse is not found"});
        //check if the logged in user can access this resource
        //if(foundCourse.owner != req.user._id) return res.status(403).json({err : "You are not allowed to view this resource"});
        return res.status(200).json({foundCourse});
    }catch(err){
        next(err)
    }
})

router.put("/details/:courseId"  , authenticateRequest , isAccountActive, async(req , res , next)=>{
    try{
        const foundCourse = await Course.findById(req.params.courseId);
        if(!foundCourse) return res.status(404).json({err : "Requested resource is not found"});
        if(! foundCourse.owner.equals(req.user._id)) return res.status(403).json({err : "You are not allowed to perform this operation"});
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


//Syllabus routes
router.patch("/:courseId/syllabus" , authenticateRequest , isAccountActive , async(req , res , next)=>{
    try{
        const course = await Course.findById(req.params.courseId);
        if(!course) return res.status(404).json({err : "Requested course not found"});
        console.log(course.owner , req.user._id)
        if(!course.owner.equals(req.user._id)) return res.status(403).json({err : "You are not allowed to perform this operation"})
        course.syllabus = req.body.syllabus;
        await course.save();
        return res.status(200).json({msg : "Syllabus has been updated" , course : course})
    }catch(err){
        next(err)
    }
})

router.get("/:courseId/syllabus" , authenticateRequest , isAccountActive , async(req , res, next)=>{
    try{
        const course = await Course.findById(req.params.courseId);
        if(!course) return res.status(404).json({err : "Requested course was not found"});
        return res.status(200).json({syllabus : course.syllabus})
    }catch(err){
        next(err)
    }
})

//Course Content Routes

//create a new section

router.post("/:courseId/content/section" , authenticateRequest , isAccountActive , async(req , res , next)=>{
    try{
        const {title , afterSectionId}= req.body
        if(!title) return res.status(400).json({err : "Required parameters missing"})
        const course = await Course.findById(req.params.courseId);
        if(!course) return res.status(404).json({err : "Course not found"})

        if(afterSectionId == '0'){
            //push
            course.content.push({title});
            await course.save()
        }else{
            //insert
            const index = course.content.findIndex(item => item._id.toString() == afterSectionId.toString())
            console.log(index)
            if(index == -1) return res.status(400).json({err : "The entered section is not found"})
            course.content.splice(index+1 , 0 , {title})
            await course.save();
        }

        return res.status(200).json({msg : "Section created"});
    }catch(err){
        next(err)
    }
})
router.patch("/:courseId/content" , authenticateRequest , isAccountActive , async(req , res , next)=>{
    try{
        const {resourceType} = req.query;
        const {link , sectionId} = req.body
        if(!resourceType || !sectionId || !link) return res.status(400).json({err : "Required parameters missing"})
        if(resourceType == 'video'){
            if(link.indexOf("youtube.com") == -1) return res.status(400).json({err : "Only youtube videos are supported"})
        }
        const course = await Course.findById(req.params.courseId)
        if(!course) return res.status(404).json({err : "Course not found"})
        const index = course.content.findIndex(item => item._id.toString() == sectionId.toString())
        if(index == -1) return res.status({err : "Provided section is not found"});
        course.content[index].secContent.push({resourceType , link})
        await course.save();
        return res.status(200).json({msg : "Resource added successfully"});
    }catch(err){
        next(err)
    }
})

router.get("/:courseId/content" , async(req , res, next)=>{
    try{
        const course = await Course.findById(req.params.courseId);
        if(!course) return res.status(404).json({err : "Course not found"})
        return res.status(200).json({content : course.content})
    }catch(err){
        next(err)
    }
})

module.exports = router;