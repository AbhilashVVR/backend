const mongoose = require('mongoose')
const crypto = require('crypto');

const SubCategorySchema = mongoose.Schema({
    categoryId: {
        type: String,
        required: true,
        trim:true
    },
    subCategoryName: {
        type: String,
        required: true,
        trim:true
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: Date.now
     },
});

module.exports = mongoose.model('SubCategory', SubCategorySchema
    );