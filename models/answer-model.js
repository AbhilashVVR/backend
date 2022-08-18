const mongoose = require('mongoose')
const crypto = require('crypto');

const AnswerSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    questionId: {
        type: String,
        required: true
    },
    grade: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    gameId: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now
     }
});

module.exports = mongoose.model('Answer', AnswerSchema
    );