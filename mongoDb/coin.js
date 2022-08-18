const CoinWallet = require("../models/coin-model");

const getCoinWallets = async () => {
  const allCoinWallets = await CoinWallet.find({}).exec();

  return Promise.resolve(allCoinWallets);
};

const createCoinWallet = async (coinDetails) => {
  const coinWallet = new CoinWallet(coinDetails);
  return Promise.resolve(await coinWallet.save());
};

const getCoinById = async (id) => {
  const allCoinWallets = await CoinWallet.findById(id).exec();

  return Promise.resolve(allCoinWallets);
};

const getCoinByName = async (name) => {
  const allCoinWallets = await CoinWallet.find({name: name}).exec();

  return Promise.resolve(allCoinWallets);
};

const editCoinById = async (id, details) => {
  var key = {};

  if (details.name) {
    key.name = details.name;
  }
  if (details.amount) {
    key.amount = details.amount;
  }
  if (details.coin) {
    key.coin = details.coin;
  }

  const updatedCoin = await CoinWallet.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );

  return Promise.resolve(updatedCoin);
};

const deleteCoin = async (id) => {
  const removedUser = await CoinWallet.remove({
    _id: id,
  });
  res.json(removedUser);
};

module.exports = {
  getCoinWallets,
  createCoinWallet,
  getCoinById,
  editCoinById,
  deleteCoin,
  getCoinByName
};
