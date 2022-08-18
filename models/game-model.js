const mongoose = require('mongoose')
const GameSchema = mongoose.Schema({
    gameName:{
        type: String,
        required: true
    },
    gameDescription:{
        type: String,
        required: true
    },
    gameType:{
        type: String,
        enum: 'New|Featured'.split('|')
    },
    bundleIdentifier:{
        type: String,
    },
    createdOn:{
        type: Date,
        default: Date.now
    },
    gameIcon:{
        type: String,
        contentType: String
    },
    // gameBanner:{
    //     type: String,
    //     contentType: String
    // },
    singlePlayer:{
        type:Boolean,
        default: false
    },
    multiPlayer:{
        type:Boolean,
        default: false
    },
    dailyCompetition:{
        type:Boolean,
        default: false
    },
    enable:{
        type: Boolean,
        default: true
    },
    status:{
        type: String,
        enum: 'Active|Inactive'.split('|')
    }
});

module.exports = mongoose.model('Game',GameSchema);