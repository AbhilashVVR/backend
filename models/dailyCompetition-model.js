const mongoose = require('mongoose');

const dailycompSchema = mongoose.Schema({
    gameName:{
        type:String,
        required:true
    },
    grade:{
        type:String,
        required:true
    },
    numberOfQuestions:{
        type:String,
        required:true
    },
    importQuestions:{
        type:String,
        required:true
    }
});
module.exports = mongoose.model('dailycomp',dailycompSchema)