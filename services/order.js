const axios = require("axios");
const { getUserById } = require("../dynamodb/database/user")
const { getCoinWithId } = require("../dynamodb/database/coin")

const RegisterOrder = async (req, res) => {
  const userId = req.body.userId;
  const coinPackageId = req.body.coin_package_id;

  const getUser = await getUserById(userId);
  if (!getUser) {
    return res.json({ message: "User Not Found" });
  }
  console.log(getUser)

  let coinDetails = await getCoinWithId(coinPackageId);
  if (!coinDetails) {
    return res.json({ message: "Coin Package Not Found" });
  }

  console.log(coinDetails);


  // client-Id production ==  149773f1cc29a6396a5dba34d1377941
  // client-Id secret == f4481b0c4a6662e648206412f71bd35a526558f6


  //TESTING
  //  "x-client-id": "10140361e8a22a0cd20f48f94a304101",
  //    "x-client-secret": "cdc5aa8548ba3233a3c53d21311d5c40091e0d76",


  try {
    var header = {
      "Content-Type": "application/json",
      "x-api-version": "2021-05-21",
      "x-client-id": "149773f1cc29a6396a5dba34d1377941",
      "x-client-secret": "f4481b0c4a6662e648206412f71bd35a526558f6",
    };

    const body = {
      order_amount: coinDetails.amount,
      order_currency: "INR",
      customer_details: {
        customer_id: getUser.id,
        customer_email: getUser.email,
        customer_name: getUser.firstName,
        customer_phone: getUser.mobileNumber,
      },
    };

    // const url = "https://sandbox.cashfree.com/pg/orders";
    const url = "https://api.cashfree.com/pg/orders"; 
    const responseData = await axios.post(url, body, {
      headers: header,
    });

    const newBody = {
      orderId: responseData.data.order_id,
      orderAmount: coinDetails.amount,
      orderCurrency: "INR"
    }

  //  const urlForToken = "https://test.cashfree.com/api/v2/cftoken/order";
  const urlForToken = "https://merchant.cashfree.com/api/v2/cftoken/order";

    const newResponseData = await axios.post(urlForToken, newBody, {
      headers: header,
    });

    console.log(responseData.data.payment_link);
    res.json({
      payment_link: responseData.data.payment_link,
      responseData: responseData.data,
      tokenResponse: newResponseData.data.cftoken
    });
  } catch (err) {
    res.json({ message: err });
  }
};

const GetOrder = async (req, res) => {
  try {
    var header = {
      "Content-Type": "application/json",
      "x-api-version": "2021-05-21",
      "x-client-id": "149773f1cc29a6396a5dba34d1377941",
      "x-client-secret": "f4481b0c4a6662e648206412f71bd35a526558f6",
    };

    // const url = `https://sandbox.cashfree.com/pg/orders/${req.params.orderId}`;
    const url = `https://api.cashfree.com/pg/orders/${req.params.orderId}`;

    const responseData = await axios.get(url, {
      headers: header,
    });

    res.json(responseData.data);
  } catch (err) {
    res.json({ message: err });
  }
};

module.exports = { GetOrder, RegisterOrder };
