const mongoose = require('mongoose');
const ExerciseSchema = mongoose.Schema({
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
        required: true
    },
    gameCategoryId:{
        type:String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    numberOfQuestions: {
        type: String,
        required: false
    },
    date: {
        type: String,
        default: new Date()
    },
    language: {
        type: String,
        enum: 'English|Hindi|Telugu|Tamil|Kannada|Malayalam'.split('|')
    },
    img_url: {
        type: String
    },
    video_url: {
        type: String,
        default: null
    },
    audio_url: {
        type: String,
        default: null
    },
    question: {
        type: String
    },
    option1: {
        type: String,
        required: true
    },
    option2: {
        type: String,
        required: true
    },
    option3: {
        type: String
    },
    option4: {
        type: String
    },
    correctAnswer: {
        type: String,
        required: true
    },
    note: String,
    categoryType:{
        type:String
    },
    level:{
        type:String,
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
        type: String
    }
});
module.exports = mongoose.model('Exercise', ExerciseSchema)