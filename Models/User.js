const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    image : {type : String , default : "https://res.cloudinary.com/dxm68x3tm/image/upload/v1678710275/linkedLearning/default_img_lusrvw.png"},
    username : {type : String , requried : true},
    password : {type : String , required : true},
    email : {type : String , required : true},
    enrolledCourses : [
        {type : mongoose.Schema.Types.ObjectId , ref :"Course"}
    ],
    isVerified : {type : Boolean , default : false},
    isActive : {type : Boolean , default : false},
    isAdmin : {type : Boolean , default : false}
})

module.exports = mongoose.model('user' , UserSchema);