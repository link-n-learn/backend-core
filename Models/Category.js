const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    title : {type : String , required : [true , "Enter title of category"]}
} , {timestamps : true});

module.exports = mongoose.model('category' , CategorySchema)