const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'notification';

function createNotificationTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
            //{ AttributeName: "categoryName", KeyType: "RANGE" },  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            // { AttributeName: "categoryName", AttributeType: "S" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

const addNewNotification = async (notificationDetails) => {

    var params = {
        TableName: tableName,
        Item: notificationDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    await docClient.put(params).promise();
    return params.Item.id
}

const getNotifications = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    console.log("Get Notification By Id...");
    var response = await docClient.scan(params).promise();

    return response
}

const getNotificationWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    return response.Item
}

const deleteTable = async (id) => {

    var params = {
        TableName: tableName,
    };
    const response = await dynamodb.deleteTable(params).promise();

    return response

}

// deleteTable()
// createNotificationTable()

module.exports = {
    addNewNotification,
    getNotifications,
    getNotificationWithId,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
