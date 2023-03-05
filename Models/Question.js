const mongoose = require("mongoose")

const AnswerSchema = new mongoose.Schema({
    owner : {
        type :mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    },
    answer : String
})
const QuestionSchema = new mongoose.Schema({
    title : {type : String , required : [true , "Please provide title"]},
    descp : {type : String},
    owner : {
        type :mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    },
    answers : [
        AnswerSchema
    ]
})

module.exports = mongoose.model("Question" , QuestionSchema)