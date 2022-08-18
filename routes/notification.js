const express = require("express");
const router = express.Router();
const {
    SendNotification,
    GetNotifications
} = require("../services/firebase");

//Submit Notification
router.post("/sendNotification", SendNotification);

//Get All Notification
router.get("/getNotification", GetNotifications);

module.exports = router;
