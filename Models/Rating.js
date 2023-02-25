const mongoose = require("mongoose")


const RatingSchema = new mongoose.Schema({
    rate : {type : Number , requried : true},
    userId : {type : mongoose.Schema.Types.ObjectId , ref:"user"},
    courseId : {type : mongoose.Schema.Types.ObjectId , ref:"Course"}
} , {timestamps : true})

module.exports = mongoose.model("rating" , RatingSchema)