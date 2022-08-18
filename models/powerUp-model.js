const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

const powerupSchema = mongoose.Schema({
    userId: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId
    },
    powerName: {
        type: String
    },
    coins: {
        type: Number
    },
    limitCount: {
        type: Number
    },
    userId: {
        type: ObjectId,
        ref: 'User'
    },
    gameId:{
        type: ObjectId,
        required: true
    },
    gameName: {
        type: String,
        required: true
    },
    isEnable: {
        type: Boolean,
        default: true
    },
    isIAP: {
        type: Boolean,
        default: true
    },
    isBuyingLimit: {
        type: Boolean,
        default: true
    }
});

powerupSchema.index({ userId: 1 }, { background: true });
module.exports = mongoose.model('Power', powerupSchema);