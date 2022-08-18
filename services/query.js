const {
  addNewQuery,
  getQueries,
  getQueryWithId } = require("../dynamodb/database/query")
const { getUserById } = require("../dynamodb/database/user")

const RegisterQuery = async (req, res) => {
  const userId = req.body.userId;

  const getUser = await getUserById(userId);
  if (!getUser) {
    return res.json({ message: "User Not Found" });
  }

  if (!req.body.message || !req.body.topic) {
    return res.json({ message: "Topic and Message Not Found" });
  }

  try {
    const savedRequest = await addNewQuery({
      topic: req.body.topic,
      message: req.body.message,
      userUniqueId: getUser.uniqueId,
    });
    res.json(savedRequest);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetQuery = async (req, res) => {
  try {
    let data = await getQueries();
    res.json(data.Items);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetQueryWithId = async (req, res) => {
  try {
    const query = await getQueryWithId(req.params.id);
    res.json(query);
  } catch (err) {
    res.json({ message: err });
  }

}

module.exports = { GetQuery, RegisterQuery, GetQueryWithId };
