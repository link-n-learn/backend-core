const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true , "please enter the title"],
        trim : true,
        maxLength : [50 , "max length is 50"],
    },
    descp : {
        type : String,
        required : [true , "please enter the description"],
        maxLength : [300 , "Max length is 300"]
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : [true , "Enter owner user"],
    },
    categoryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "category",
        required : [true , "Choose a category"]
    }
} , {timestamps : true});

module.exports = mongoose.model("Course" , CourseSchema)