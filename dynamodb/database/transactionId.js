const { dynamodb, docClient } = require('../../config');
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'transaction-id';

function createTransactionIdTable() {

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

const addNewTransactionId = async (transactionIdDetails) => {

    var params = {
        TableName: tableName,
        Item: transactionIdDetails
    };
    params.Item.id = generateId(transactionIdDetails.userId, transactionIdDetails.gameId);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    await docClient.put(params).promise();
    return params.Item.id
}

const getTransactionIds = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getTransactionIdWithId = async (userId, gameId) => {

    const id = generateId(userId, gameId);

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const updateTransactionIds = async (previousTransactionId, updatedTransactionIds) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousTransactionId.id
        },
        UpdateExpression: "set transactionIds = :transactionIds, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
            ":transactionIds": updatedTransactionIds,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteTransactionId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id
        },
        ConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    };
    const response = await docClient.delete(params).promise();

    return response

}

const deleteTable = async (id) => {

    var params = {
        TableName: tableName,
    };
    const response = await dynamodb.deleteTable(params).promise();

    return response

}

const generateId = (userId, gameId) => {
    return `${userId}-${gameId}`
}

// deleteTable()
//createTransactionIdTable()

module.exports = {
    addNewTransactionId,
    getTransactionIds,
    getTransactionIdWithId,
    updateTransactionIds,
    deleteTransactionId,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
