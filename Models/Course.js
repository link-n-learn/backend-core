const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema({
    title : {
        type : String,
        required : [true , "please enter the title"],
        trim : true,
        maxLength : [50 , "max length is 50"],
    },
    image : {
        type : String,
        required : [true , "Please upload thumbnail image"]
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
    },
    syllabus : [
            {
                title : {type : String , required : true},
                subTopics : {type : String , required : true}
            }
    ]
} , {timestamps : true});

module.exports = mongoose.model("Course" , CourseSchema)