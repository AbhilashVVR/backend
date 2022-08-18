const { getDate, getPreviousDate } = require("./dateFunction");
const { addNewTransaction, getTransactions } = require("../dynamodb/database/transactions");
const {
  getUserById,
  updateUserById,
} = require("../dynamodb/database/user")
const { getRewards } = require("../dynamodb/database/rewards");

const AddNewTransaction = async (req, res, next) => {

  console.log(req);

  const transactions = await getTransactions();
  const getTransaction = transactions.Items.filter(transaction => transaction.transactionId === req.body.transactionId);

  if (getTransaction.length === 0) {
    try {
      let walletCoins = 0;
      const getUser = await getUserById(req.body.userId);

      if (!getUser) {
        return res.json({ message: "User Not found" });
      }

      if (!req.body.coins) {
        return res.json({ message: "Please Provide Transaction Coins" });
      }

      if (
        !req.body.type ||
        !(
          req.body.type === "Purchase" ||
          req.body.type === "Spend" ||
          req.body.type === "Earn" ||
          req.body.type === "Refer"
        )
      ) {
        return res.json({
          message: "Please Provide Proper Transaction Type",
          type: "'Purchase', 'Spend', 'Earn'",
        });
      }

      if (req.body.type === "Spend") {
        walletCoins = parseInt(getUser.walletCoin) - parseInt(req.body.coins);
      } else {
        walletCoins = parseInt(getUser.walletCoin) + parseInt(req.body.coins);
      }
      if (walletCoins < 0) {
        return res.json({
          message: "Your Wallet Coins are too low for this transaction",
        });
      }

      const transaction = await addNewTransaction({
        transactionId: req.body.transactionId,
        type: req.body.type,
        coins: req.body.coins,
        userId: req.body.userId,
        rewardId: req.body.rewardId,
        reason: req.body.reason,
        date: getDate(),
      });

      console.log("transac", transaction)

      if (transaction) {

        const update = await updateUserById(getUser, {
          walletCoin: walletCoins,
          userName: getUser.userName || null,
        });

        console.log("update", update);
      }
      res.json({ transactionId: transaction, message: "Transaction is done" });
    } catch (err) {
      res.json({ message: err });
    }
  }
  res.json({ message: "Transaction Already Made", status: 400 });
};

const AddRewardTransaction = async (req, res, next) => {
  const transactions = await getTransactions();
  const getTransaction = transactions.Items.filter(transaction => transaction.transactionId === req.body.transactionId);

  if (getTransaction.length === 0) {
    try {
      let walletCoins = 0;
      let count = 0;
      let rewardAmount = 0;
      let rewardValueId = "";

      const getUser = await getUserById(req.body.userId);

      if (!getUser) {
        return res.json({ message: "User Not Found" });
      }

      const transactions = await getTransactions();
      const rewardTransactionDetailsForToday = transactions.Items.filter(transaction =>
      ((transaction.userId === req.body.userId) &&
        (transaction.type === 'Reward') &&
        (transaction.date === getDate()))
      );

      if (rewardTransactionDetailsForToday.length > 0) {
        return res.json({ message: "Reward Already Claimed" });
      }

      const rewardTransactionDetailsForYesterday =
        transactions.Items.filter(transaction =>
        ((transaction.userId === req.body.userId) &&
          (transaction.type === 'Reward') &&
          (transaction.date === getPreviousDate()))
        );

      const reward = await getRewards();

      if (rewardTransactionDetailsForYesterday.length) {
        reward.Items.forEach((detail, index) => {
          if (detail.id === rewardTransactionDetailsForYesterday[0].rewardId) {
            count = index + 1;
          }
        });
      }

      if (count >= reward.Items.length) {
        walletCoins = parseInt(getUser.walletCoin) + parseInt(reward.Items[0].amount);
        rewardValueId = reward.Items[0].id;
        rewardAmount = reward.Items[0].amount;
      } else {
        walletCoins = parseInt(getUser.walletCoin) + parseInt(reward.Items[count].amount);
        rewardValueId = reward.Items[count].id;
        rewardAmount = reward.Items[count].amount;
      }

      const transaction = await addNewTransaction({
        transactionId: req.body.transactionId,
        type: "Reward",
        coins: rewardAmount,
        userId: req.body.userId,
        reason: `You got Daily Rewards`,
        rewardId: rewardValueId,
        date: getDate(),
      });

      if (transaction) {
        await updateUserById(getUser, {
          walletCoin: walletCoins,
          userName: getUser.userName || null,
        });
      }
      res.json({ transactionId: transaction, message: "Reward Claimed for Today" });
    } catch (err) {
      res.json({ message: err });
    }
  }
  res.json({ message: "Transaction Already Made", status: 400 });
};

const GetTransactionByUserId = async (req, res) => {
  try {
    const transactions = await getTransactions();
    const savedRequest = transactions.Items.filter(transaction => transaction.userId === req.params.userId);

    res.json(savedRequest);
  } catch (ex) {
    res.json({ message: ex });
  }
};

const GetTransactionByType = async (req, res) => {
  try {
    const transactions = await getTransactions();
    const savedRequest = transactions.Items.filter(transaction => transaction.type === req.params.type);
    res.json(savedRequest);
  } catch (ex) {
    res.json({ message: ex });
  }
};

const GetTransactionByUserIdAndType = async (req, res) => {
  try {
    const transactions = await getTransactions();
    const savedRequest = transactions.Items.filter(transaction =>
    ((transaction.userId === req.params.userId) &&
      (transaction.type === req.params.type))
    );

    res.json(savedRequest);
  } catch (ex) {
    res.json({ message: ex });
  }
};

module.exports = {
  AddNewTransaction,
  AddRewardTransaction,
  GetTransactionByUserId,
  GetTransactionByType,
  GetTransactionByUserIdAndType,
};
