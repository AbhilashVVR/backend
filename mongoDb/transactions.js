const Transaction = require("../models/transaction-model");

const getTransactionByTransactionId = async (req, res, next) => {
  const transaction = await Transaction.findOne({
    transactionId: req,
  });
  return Promise.resolve(transaction);
};

const createTransaction = async (transactionDetails) => {
  const transaction = new Transaction(transactionDetails);
  return Promise.resolve(await transaction.save());
};

const getAllTransactionByUserId = async (userId) => {
  const allTransactionOfUser = await Transaction.find({
    userId: userId,
  }).exec();

  return Promise.resolve(allTransactionOfUser);
};

const getAllTransactionByType = async (type) => {
  const allTransactionOfUser = await Transaction.find({
    type: type,
  }).exec();

  return Promise.resolve(allTransactionOfUser);
};

const getAllTransactionByUserIdAndType = async (userId, type) => {
  const allTransactionOfUser = await Transaction.find({
    userId: userId,
    type: type,
  }).exec();

  return Promise.resolve(allTransactionOfUser);
};

const getAllTransactionOfUserByType = async (userId, type) => {
  const allTransactionOfUserByType = await Transaction.find({
    userId: userId,
    type: type,
  }).exec();

  return Promise.resolve(allTransactionOfUserByType);
};

const getAllTransactionOfUserByDate = async (userId, date) => {
  const allTransactionOfUserByDate = await Transaction.find({
    userId: userId,
    date: date,
  }).exec();

  return Promise.resolve(allTransactionOfUserByDate);
};

const getAllTransactionOfUserByTypeAndDate = async (userId, type, date) => {
  const allTransactionOfUserByTypeAndDate = await Transaction.find({
    userId: userId,
    type: type,
    date: date,
  }).exec();

  return Promise.resolve(allTransactionOfUserByTypeAndDate);
};

module.exports = {
  getTransactionByTransactionId,
  createTransaction,
  getAllTransactionByUserId,
  getAllTransactionByType,
  getAllTransactionByUserIdAndType,
  getAllTransactionOfUserByType,
  getAllTransactionOfUserByDate,
  getAllTransactionOfUserByTypeAndDate,
};
