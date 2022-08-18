const mongoose = require('mongoose')
const crypto = require('crypto');

const CoinWalletSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    coin: {
        type: Number,
        required: true,
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now
     },
});

module.exports = mongoose.model('CoinWallet', CoinWalletSchema);