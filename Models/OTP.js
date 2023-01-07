const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    otp : {type : String , required : true},
    userId : {type : mongoose.Schema.Types.ObjectId , required : true},
    createdAt: { type: Date, expires: 20, default: Date.now }
})

module.exports = mongoose.model('otp' , OTPSchema);