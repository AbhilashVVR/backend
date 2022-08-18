const {
  addNewCoin,
  getCoins,
  deleteCoin,
  getCoinWithId,
  editCoinById
} = require('../dynamodb/database/coin')

const GetCoinWallets = async (req, res) => {
  try {
    const coins = await getCoins();
    res.json(coins.Items);
  } catch (err) {
    res.json({ message: err });
  }
};

const CreateCoinWallet = async (req, res) => {
  const coin = {
    coinName: req.body.name,
    coin: req.body.coin,
    amount: req.body.amount,
  };
  try {
    const savedCoin = await addNewCoin(coin);
    res.json(savedCoin);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetCoinById = async (req, res) => {
  try {
    let data = await getCoinWithId(req.params.id);
    res.json(data);
  } catch (err) {
    res.json({ message: err });
  }
};

const EditCoinById = async (req, res) => {
  try {
    data = await getCoinWithId(req.params.id);
    await editCoinById(data, {
      coinName: req.body.name,
      amount: req.body.amount,
      coin: req.body.coin,
    });

    const updatedCoin = await getCoinWithId(req.params.id);

    res.json(updatedCoin);
  } catch (ex) {
    res.json({ message: ex });
  }
};

const DeleteCoin = async (req, res) => {
  try {
    await deleteCoin(req.params.id);
    res.json({
      message: "Your Coin Wallet is deleted Successfully",
    });
  } catch (err) {
    res.json({ message: err });
  }
};

const GetCoinByName = async (req, res) => {
  try {
    const coins = await getCoins();

    const coinsByName = coins.Items.filter(coin => coin.name === req.params.name);
    res.json(coinsByName);
  } catch (err) {
    res.json({ message: err });
  }
}

module.exports = {
  GetCoinWallets,
  CreateCoinWallet,
  GetCoinById,
  EditCoinById,
  DeleteCoin,
  GetCoinByName,
};
