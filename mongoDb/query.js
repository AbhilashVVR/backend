const QueryData = require("../models/query-model");

const getQuery = async () => {
  const allQuerry = await QueryData.find({}).sort({"createdAt": -1}).exec();

  return Promise.resolve(allQuerry);
};

const registerQuery = async (queryDetails) => {
  const queryData = new QueryData(queryDetails);
  return Promise.resolve(await queryData.save());
};

module.exports = { getQuery, registerQuery };
