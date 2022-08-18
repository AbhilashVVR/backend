const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'purchase';

function createPurchaseTable() {
    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
            //{ AttributeName: "purchaseName", KeyType: "RANGE" },  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "transactionId", AttributeType: "S" },
            { AttributeName: "userId", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "transactionId",
                KeySchema:
                    [
                        {
                            AttributeName: "transactionId",
                            KeyType: "HASH"
                        }
                    ],
                Projection:
                    { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 10,
                    WriteCapacityUnits: 10
                }
            },
            {
                IndexName: "userId",
                KeySchema:
                    [
                        {
                            AttributeName: "userId",
                            KeyType: "HASH"
                        }
                    ],
                Projection:
                    { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 10,
                    WriteCapacityUnits: 10
                }
            },
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
const addNewPurchase = async (purchaseDetails) => {
    var params = {
        TableName: tableName,
        Item: purchaseDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;
    await docClient.put(params).promise();
    return params.Item.id
}
const getPurchases = async () => {
    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };
    console.log("Get category By Id...");
    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    return response
}
const getPurchaseWithId = async (id) => {
    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };
    var response = await docClient.get(params).promise()
    return response.Item
}
const getPurchasesByTransactionId = async (userId) => {

    const params = {
        TableName: tableName,
        IndexName: 'userId',
        KeyConditionExpression: '#userId = :userId',
        ExpressionAttributeNames: {
            '#userId': 'userId'
        },
        ExpressionAttributeValues: {
            ':userId': `${userId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getPurchasesByUserId = async (transactionId) => {

    const params = {
        TableName: tableName,
        IndexName: 'transactionId',
        KeyConditionExpression: '#transactionId = :transactionId',
        ExpressionAttributeNames: {
            '#transactionId': 'transactionId'
        },
        ExpressionAttributeValues: {
            ':transactionId': `${transactionId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const editPurchaseById = async (previousPurchase, details) => {
    
    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousPurchase.id
        },
        UpdateExpression: "set userId = :userId, amount = :amount, status = :status, coinPackageId = :coinPackageId, transactionId = :transactionId, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
            ":userId": previousPurchase.userId,
            ":amount": previousPurchase.amount,
            ":status": details.status,
            ":coinPackageId": previousPurchase.coinPackageId,
            ":transactionId": previousPurchase.transactionId,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes
}
const deletePurchase = async (id) => {
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
    const response = await dynamodb.deleteTable(params).promise();//
    return response
}
//deleteTable()
//createPurchaseTable()
module.exports = {
    addNewPurchase,
    getPurchases,
    getPurchaseWithId,
    getPurchasesByTransactionId,
    getPurchasesByUserId,
    editPurchaseById,
    deletePurchase,
};
// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb