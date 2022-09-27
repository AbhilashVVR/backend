const { getAnalytics } = require("../dynamodb/database/analytics");

const TotalAnalytics = async (req, res) => {
  console.log("HI");
  console.log("HELLO1");
  try {
    console.log("HELLO");
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (err) {
    console.log("ERR", err);
    res.json({ message: err });
  }
};

module.exports = {
  TotalAnalytics,
};
