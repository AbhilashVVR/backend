const mongoose = require('mongoose')
const crypto = require('crypto');

const TransactionSchema = mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        trim:true
    },
    userId: {
        type: String,
        required: true,
        trim:true
    },
    type: {
        type: String,
        enum: ['Purchase', 'Spend', 'Reward', 'Earn', 'Refer'],
        required: true
    },
    rewardId: {
        type: String,
        required: true,
        default: 'no-reward'
    },
    coins: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now
     }
});

module.exports = mongoose.model('Transaction', TransactionSchema);