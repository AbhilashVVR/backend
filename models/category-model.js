const mongoose = require('mongoose')
const crypto = require('crypto');

const CategorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        trim:true
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now
     },
     numberOfSubCat:{
         type: Number,
         required: true,
         default: 0
         
     },
    isEnabled: { 
        type: Boolean, 
        required: true, 
        default: true
     },
});

module.exports = mongoose.model('Category', CategorySchema);