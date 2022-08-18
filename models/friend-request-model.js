const mongoose = require('mongoose')
const crypto = require('crypto');

const FriendRequestSchema = mongoose.Schema({
    senderId: {
        type: String,
        required: true,
        trim: true
    },
    receiverId: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    requestDate: { 
        type: Date, 
        required: true, 
        default: Date.now
     },
});

module.exports = mongoose.model('FriendRequest', FriendRequestSchema);