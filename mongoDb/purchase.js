const Purchase = require("../models/purchase-model");

const addNewPurchase = async (details) => {
  const purchase = new Purchase(details);
  return Promise.resolve(await purchase.save());
};

const getPurchaseWithId = async (req, res, next) => {
  const purchase = await Purchase.findById(req);
  return Promise.resolve(purchase);
};

const getPurchases = async (req, res, next) => {
  const purchase = await Purchase.find().sort({createdAt: -1 }).exec();
  return Promise.resolve(purchase);
};

const getPurchaseWithTransactionId = async (req, res, next) => {
  const purchase = await Purchase.find({ transactionId: req });
  return Promise.resolve(purchase);
};

const getPurchaseWithUserId = async (req, res, next) => {
  const purchase = await Purchase.find({ userId: req }).sort({createdAt: -1 });
  return Promise.resolve(purchase);
};

const updatePurchaseStatus = async (id, status) => {
  var key = {
    status: status,
  };

  const updatedPurchase = await Purchase.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );
  return Promise.resolve(updatedPurchase);
};

module.exports = {
  getPurchases,
  addNewPurchase,
  getPurchaseWithId,
  getPurchaseWithTransactionId,
  getPurchaseWithUserId,
  updatePurchaseStatus,
};
