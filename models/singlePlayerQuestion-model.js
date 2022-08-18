const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;
const SinglequeSchema = mongoose.Schema({
    gameId: {
        type: ObjectId,
        ref: 'Game',
        required: true
    },
    gameCategoryId:{
        type:String,
    },
    grade: {
        type: Number,
        required: true
    },
    gradeName: {
        type: String,
        required: true
    },
    gameCategory: {
        type: String,
        required: true
    },
    numberOfQuestions: {
        type: String,
    },
    date: {
        type: String
    },
    language: {
        type: String,
        enum: 'English|Hindi|Telugu|Tamil|Kannada|Malayalam'.split('|')
    },
    img_url: {
        type: String
    },
    video_url: {
        type: String
    },
    audio_url: {
        type: String
    },
    question: {
        type: String
    },
    option1: {
        type: String
    },
    option2: {
        type: String
    },
    option3: {
        type: String
    },
    // option4: {
    //     type: String
    // },
    correctAnswer: {
        type: String
    },
    note: String,
    categoryType:{
        type:String
    },  
    level:{
        type:Number,
        required: true
    },
    words:{
        type:String
    },
    url:{
        type:String
    },
    answer:{
        type:String
    },
    timer:{
        type:String
    },
    grid:{
        type:String
    }
});
module.exports = mongoose.model('Singleque', SinglequeSchema)