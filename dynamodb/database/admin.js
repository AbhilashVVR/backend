const { dynamodb, docClient } = require("../../config");
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = "admin";

function createAdminTable() {
  var params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }, //Partition key
    ],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  };

  dynamodb.createTable(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to create table. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log(
        "Created table. Table description JSON:",
        JSON.stringify(data, null, 2)
      );
    }
  });
}

const addNewAdmin = async (adminDetails) => {
  var params = {
    TableName: tableName,
    Item: adminDetails,
  };
  params.Item.id = randomstring.generate(20);
  params.Item.createdAt = formatInTimeZone(
    new Date(),
    "Asia/Kolkata",
    "yyyy-MM-dd HH:mm:ssXXX"
  );
  params.Item.updatedAt = null;

  await docClient.put(params).promise();
  return params.Item.id;
};

const getAdmins = async () => {
  var params = {
    TableName: tableName,
    Select: "ALL_ATTRIBUTES",
  };
  console.log("PARAMS", params);
  var response = await docClient.scan(params).promise();
  console.log("RESPONSE", response);
  response.Items = response.Items.sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
  );

  return response;
};

const deleteAdmin = async (id) => {
  var params = {
    TableName: tableName,
    Key: {
      id: id,
    },
    ConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id,
    },
  };

  console.log("Attempting a conditional delete...");
  const response = await docClient.delete(params).promise();

  return response;
};

const getAdminWithId = async (id) => {
  var params = {
    TableName: tableName,
    Key: {
      id: id,
    },
  };

  var response = await docClient.get(params).promise();
  return response.Item;
};

const editAdminById = async (previousAdmin, details) => {
  const updatedAt = formatInTimeZone(
    new Date(),
    "Asia/Kolkata",
    "yyyy-MM-dd HH:mm:ssXXX"
  ); // 2014-10-25 06:46:20-04:00

  var params = {
    TableName: tableName,
    Key: {
      id: previousAdmin.id,
    },
    UpdateExpression:
      "set adminName = :adminName, amount = :amount, coin = :coin, updatedAt =:updatedAt",
    ExpressionAttributeValues: {
      ":adminName": details.adminName || previousAdmin.adminName,
      ":amount": details.amount || previousAdmin.amount,
      ":coin": details.coin || previousAdmin.coin,
      ":updatedAt": updatedAt,
    },
    ReturnValues: "UPDATED_NEW",
  };

  var response = await docClient.update(params).promise();
  return response.Attributes;
};

//createAdminTable()

module.exports = {
  addNewAdmin,
  getAdmins,
  deleteAdmin,
  getAdminWithId,
  editAdminById,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
