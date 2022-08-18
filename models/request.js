const mongoose = require('mongoose')
const User = require('../models/user-model')

const sendRequestSchema = mongoose.Schema({
    senderUserId: {
        type: Number,
        required: true
    },
    receiverUserId: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true,
        default: 0
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now
     },
});

module.exports = mongoose.model('RequestList', sendRequestSchema);