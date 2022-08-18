const mongoose = require('mongoose')

const AdminSchema = mongoose.Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    userName:{
        type: String
    },
    email:{
        type: String,
        required: true
    },
    phoneNumber:{
        type: String,
        required: true,
        unique: true,
        minlength: 10,
        maxlength: 10
    },
    password:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true
    }

});

module.exports = mongoose.model('Admin',AdminSchema);