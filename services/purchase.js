const { getDate } = require("./dateFunction");
const {
  addNewPurchase,
  getPurchases,
  getPurchasesByTransactionId,
  getPurchasesByUserId,
  getPurchaseWithId,
  editPurchaseById,
} = require("../dynamodb/database/purchase");

const { editAnalyticsById } = require("../dynamodb/database/analytics")
const { getCoinWithId } = require("../dynamodb/database/coin");
const { getUserById, updateUserById } = require("../dynamodb/database/user");


const { addNewTransaction } = require("../dynamodb/database/transactions");
const GetPurchases = async (req, res) => {
  try {
    const purchase = await getPurchases();
    res.json(purchase.Items);
  } catch (err) {
    res.json({ message: err });
  }
};


const AddNewPurchase = async (req, res) => {

  let coinDetails = await getCoinWithId(req.body.coin_package_id);
  if (!coinDetails) {
    return res.json({ message: "Coin Package Not Found" });
  }


  const user = await getUserById(req.body.userId);
  if (!user) {
    return res.json({ message: "User Not Found" });
  }
  const purchase = await getPurchasesByTransactionId(req.body.transactionId);
  console.log(purchase);
  if (purchase.Items.length) {
    return res.json({ message: "This Transaction is already Made" });
  }
  if (
    !req.body.status ||
    !(
      req.body.status === "Failed" ||
      req.body.status === "Pending" ||
      req.body.status === "Success"
    )
  ) {
    return res.json({
      message: "Please Provide Proper Transaction Status",
      status: "'Failed', 'Pending', 'Success'",
    });
  }
  const purchaseBody = {
    userId: req.body.userId,
    coinPackageId: req.body.coin_package_id,
    status: req.body.status,
    transactionId: req.body.transactionId,
    amount: coinDetails.amount,
  };
  try {
    const purchaseId = await addNewPurchase(purchaseBody);
    const purchase = await getPurchaseWithId(purchaseId);
    console.log(purchase);
    if (purchase.status === "Success") {
      const transactionBody = {
        transactionId: req.body.transactionId,
        type: "Purchase",
        coins: coinDetails.coin,
        userId: req.body.userId,
        reason: req.body.reason,
        date: getDate(),
      };
      await editAnalyticsById({ totalPayment: parseInt(coinDetails.amount) })
      console.log(transactionBody);
      const transaction = await addNewTransaction(transactionBody);
      console.log(transaction);
      const walletCoins = parseInt(user.walletCoin) + parseInt(coinDetails.coin);
      await updateUserById(user, {
        walletCoin: walletCoins,
        userName: user.userName || null,
      });
    }
    return res.json(purchase);
  } catch (err) {
    res.json({ message: err });
  }
};
const GetPurchaseWithId = async (req, res) => {
  try {
    let data = await getPurchaseWithId(req.params.id);
    res.json(data);
  } catch (err) {
    res.json({ message: err });
  }
};
const GetPurchaseWithTransactionId = async (req, res) => {
  try {
    const purchaseByTransactionId = await getPurchasesByTransactionId(req.params.transactionId);
    res.json(purchaseByTransactionId.Items);
  } catch (err) {
    res.json({ message: err });
  }
};
const GetPurchaseWithUserId = async (req, res) => {
  try {
    const purchaseByUserId = await getPurchasesByUserId(req.params.userId);
    res.json(purchaseByUserId.Items);
  } catch (err) {
    res.json({ message: err });
  }
};
const UpdatePurchaseStatus = async (req, res) => {
  try {
    if (
      !req.params.status ||
      !(req.params.status === "Failed" || req.params.status === "Success")
    ) {
      return res.json({
        message: "Please Provide Proper Transaction Status",
        status: "'Failed', 'Success'",
      });
    }
    const data = await getPurchasesByTransactionId(req.params.transactionId);
    if (!data.Items.length) {
      return res.json({ message: "Transaction Not Found" });
    }

    if (data.items[0].status !== "Pending") {
      return res.json({ message: "Status Can't Be Updated" });
    }

    await editPurchaseById(data.items[0], { status: req.params.status });
    let updatedPurchase = await getPurchaseWithId(data.items[0].id);
    console.log(updatedPurchase.status);

    let coinDetails = await getCoinWithId(updatedPurchase.coinPackageId);
    const user = await getUserById(updatedPurchase.userId);

    if (updatedPurchase.status === "Success") {
      const transaction = await addNewTransaction({
        transactionId: req.params.transactionId,
        type: "Purchase",
        coins: coinDetails.coin,
        userId: updatedPurchase.userId,
        reason: req.body.reason,
        date: getDate(),
      });
      console.log(transaction);
      const walletCoins = parseInt(user.walletCoin) + parseInt(coinDetails.coin);
      await updateUserById(user, {
        walletCoin: walletCoins,
        userName: user.userName || null,
      });
    }
    res.json(updatedPurchase);
  } catch (err) {
    res.json({ message: err });
  }
};
module.exports = {
  GetPurchases,
  AddNewPurchase,
  GetPurchaseWithId,
  GetPurchaseWithTransactionId,
  GetPurchaseWithUserId,
  UpdatePurchaseStatus,
};