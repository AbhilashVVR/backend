const express = require("express");
const User = require("../models/user-model");

const getUserByUserId = async(req, res, next) => {
    const userDetails = await User.findById(req);
    return Promise.resolve(userDetails);
};

const getUserByEmail = async(req, res, next) => {
    const userDetails = await User.find({ email: req });
    return Promise.resolve(userDetails);
};

const updateUserById = async(userId, details) => {
    var key = {};
    if (details.walletCoin) {
        key.walletCoin = details.walletCoin;
    }
    if (details.gameDetails) {
        key.gameDetails = details.gameDetails;
    }

    const data = await User.updateOne({ _id: userId }, {
        $set: key,
    });
};

module.exports = { getUserByUserId, getUserByEmail, updateUserById };