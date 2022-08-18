const Order = require("../models/order-model");

const getOrders = async () => {
  const allOrders = await Order.find({}).sort({"createdAt": -1}).exec();

  return Promise.resolve(allOrders);
};

const registerOrder = async (orderDetails) => {
    
//   const orderData = new Order(queryDetails);
//   return Promise.resolve(await orderData.save());
};

module.exports = { getOrders, registerOrder };
