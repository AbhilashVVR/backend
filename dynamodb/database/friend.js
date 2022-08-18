const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'friend';

function createFriendTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
            //{ AttributeName: "friendName", KeyType: "RANGE" },  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "senderId", AttributeType: "S" },
            { AttributeName: "receiverId", AttributeType: "S" },
            { AttributeName: "requestStatus", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "statusAndSenderId",
                KeySchema:
                    [
                        {
                            AttributeName: "requestStatus",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "senderId",
                            KeyType: "RANGE"
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
                IndexName: "statusAndReceiverId",
                KeySchema:
                    [
                        {
                            AttributeName: "requestStatus",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "receiverId",
                            KeyType: "RANGE"
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
                IndexName: "senderIdAndReceiverId",
                KeySchema:
                    [
                        {
                            AttributeName: "senderId",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "receiverId",
                            KeyType: "RANGE"
                        }
                    ],
                Projection:
                    { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 10,
                    WriteCapacityUnits: 10
                }
            }
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

const addNewFriend = async (friendDetails) => {

    var params = {
        TableName: tableName,
        Item: friendDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;
    params.Item.requestStatus = friendDetails.requestStatus.toString()

    await docClient.put(params).promise();
    return params.Item.id
}

const getFriends = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getFriendWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const getActiveFriendRequestSent = async (senderId) => {

    const params = {
        TableName: tableName,
        IndexName: 'statusAndSenderId',
        KeyConditionExpression: '#senderId = :senderId AND #requestStatus = :requestStatus',
        ExpressionAttributeNames: {
            '#senderId': 'senderId',
            '#requestStatus': 'requestStatus'
        },
        ExpressionAttributeValues: {
            ':senderId': `${senderId}`,
            ':requestStatus': 'false'
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getActiveFriendRequestRecieve = async (receiverId) => {

    const params = {
        TableName: tableName,
        IndexName: 'statusAndReceiverId',
        KeyConditionExpression: '#receiverId = :receiverId AND #requestStatus = :requestStatus',
        ExpressionAttributeNames: {
            '#receiverId': 'receiverId',
            '#requestStatus': 'requestStatus'
        },
        ExpressionAttributeValues: {
            ':receiverId': `${receiverId}`,
            ':requestStatus': 'false'
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getActiveFriendSent = async (senderId) => {

    const params = {
        TableName: tableName,
        IndexName: 'statusAndSenderId',
        KeyConditionExpression: '#senderId = :senderId AND #requestStatus = :requestStatus',
        ExpressionAttributeNames: {
            '#senderId': 'senderId',
            '#requestStatus': 'requestStatus'
        },
        ExpressionAttributeValues: {
            ':senderId': `${senderId}`,
            ':requestStatus': 'true'
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getActiveFriendRecieve = async (receiverId) => {

    const params = {
        TableName: tableName,
        IndexName: 'statusAndReceiverId',
        KeyConditionExpression: '#receiverId = :receiverId AND #requestStatus = :requestStatus',
        ExpressionAttributeNames: {
            '#receiverId': 'receiverId',
            '#requestStatus': 'requestStatus'
        },
        ExpressionAttributeValues: {
            ':receiverId': `${receiverId}`,
            ':requestStatus': 'true'
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}


const getFriendRequestDetails = async (receiverId, senderId) => {

    const params = {
        TableName: tableName,
        IndexName: 'senderIdAndReceiverId',
        KeyConditionExpression: '#receiverId = :receiverId AND #senderId = :senderId',
        ExpressionAttributeNames: {
            '#receiverId': 'receiverId',
            '#senderId': 'senderId'
        },
        ExpressionAttributeValues: {
            ':receiverId': `${receiverId}`,
            ':senderId': `${senderId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getFriendListDetails = async (receiverId, senderId) => {

    const params = {
        TableName: tableName,
        IndexName: 'senderIdAndReceiverId',
        KeyConditionExpression: '#receiverId = :receiverId AND #senderId = :senderId',
        ExpressionAttributeNames: {
            '#receiverId': 'receiverId',
            '#senderId': 'senderId'
        },
        ExpressionAttributeValues: {
            ':receiverId': `${receiverId}`,
            ':senderId': `${senderId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const editFriendById = async (previousFriend, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousFriend.id
        },
        UpdateExpression: "set receiverId = :receiverId, senderId = :senderId, requestStatus = :requestStatus, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
            ":receiverId": details.receiverId || previousFriend.receiverId,
            ":senderId": details.senderId || previousFriend.senderId,
            ":requestStatus": details.requestStatus,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteFriend = async (id) => {

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

//deleteTable()
//createFriendTable()

module.exports = {
    addNewFriend,
    getFriends,
    getFriendWithId,
    getActiveFriendRequestSent,
    getActiveFriendRequestRecieve,
    getActiveFriendSent,
    getActiveFriendRecieve,
    getFriendRequestDetails,
    getFriendListDetails,
    editFriendById,
    deleteFriend,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
