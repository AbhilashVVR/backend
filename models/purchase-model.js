const mongoose = require('mongoose')
const crypto = require('crypto');

const PurchaseSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
        trim: true
    },
    // deviceId: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Failed', 'Pending', 'Success'],
        required: true
    },
    coinPackageId: {
        type: String,
        required: true,
        trim: true
    },
    transactionId: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now
     }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);