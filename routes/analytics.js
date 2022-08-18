const express = require('express');
const router = express.Router();
const {
    TotalAnalytics
} = require('../services/analytics')
//Get All Admins
router.get('/', TotalAnalytics);

//Submit All Admins
//router.post('/verfiedUser', VerifiedUser);

module.exports = router;