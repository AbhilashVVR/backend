// const mongoose = require('mongoose')
// const crypto = require('crypto');

// const WalletSchema = mongoose.Schema({
//     userId: {
//         ref: 'User',
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     },
//     credit: {
//         type: Number,
//         // required: true,
//         default: 0
//     },
//     totalCredit: {
//         type: Number,
//         default: 0
//     },
//     totalDebit: {
//         type: Number,
//         default: 0
//     },
//     debit: {
//         type: Number,
//         // required: true,
//         default: 0
//     },
//     reason: {
//         type: String
//     },
//     entrytype: {
//         type: String,
//         enum: ['Payment', 'Rewards', 'Game'],
//         default: 'Game'
//     },
//     // deviceId:{
//     //     type: Number,
//     // },
//     createdAt: { 
//         type: Date, 
//         default: Date.now
//      },
// });

// module.exports = mongoose.model('Wallet', WalletSchema);