const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username : {type : String , requried : true},
    password : {type : String , required : true},
    email : {type : String , required : true},
    isVerified : {type : Boolean , default : false},
    isActive : {type : Boolean , default : false},
    isAdmin : {type : Boolean , default : false}
})

module.exports = mongoose.model('user' , UserSchema);