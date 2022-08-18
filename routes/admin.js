const express = require('express');
const router = express.Router();

const {
    GetAllAdmin,
    RegisterNewAdmin,
    LoginAdmin,
    DeleteAdmin
} = require('../services/admin')

//Get All Admins
router.get('/', GetAllAdmin);

//Submit All Admins
router.post('/register', RegisterNewAdmin);

// login 
router.post('/login', LoginAdmin);

router.delete('/delete-admin/:_id', DeleteAdmin);

module.exports = router;