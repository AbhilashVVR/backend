const { dynamodb, docClient } = require('../../config');
const { formatInTimeZone } = require("date-fns-tz");

const randomstring = require("randomstring");
const tableName = 'answers';
function createAnswerTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "questionId", AttributeType: "S" },
            { AttributeName: "userId", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "questionId",
                KeySchema:
                    [
                        {
                            AttributeName: "questionId",
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
            {
                IndexName: "userIdAndQuestionId",
                KeySchema:
                    [
                        {
                            AttributeName: "userId",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "questionId",
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

const addNewAnswer = async (answerDetails) => {

    var params = {
        TableName: tableName,
        Item: answerDetails
    };

    params.Item.id = randomstring.generate(20),
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');

    try {
        await docClient.put(params).promise();

        return params.Item.id;

    } catch (error) {
        return error;
    }

}

const getAnswers = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };
    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getAnswersByQuestionId = async (questionId) => {

    const params = {
        TableName: tableName,
        IndexName: 'questionId',
        KeyConditionExpression: '#questionId = :questionId',
        ExpressionAttributeNames: {
            '#questionId': 'questionId'
        },
        ExpressionAttributeValues: {
            ':questionId': `${questionId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getAnswersByUserId = async (userId) => {

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

const getAnswersByUserIdAndQuestionId = async (userId, questionId) => {

    const params = {
        TableName: tableName,
        IndexName: 'userIdAndQuestionId',
        KeyConditionExpression: '#userId = :userId AND #questionId = :questionId',
        ExpressionAttributeNames: {
            '#userId': 'userId',
            '#questionId': 'questionId',
        },
        ExpressionAttributeValues: {
            ':userId': `${userId}`,
            ':questionId': `${questionId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

function deleteAnswer(id) {

    var params = {
        TableName: tableName,
        Key: {
            "id": id
        },
        ConditionExpression: "id === :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    };

    docClient.delete(params, function (err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            return JSON.stringify(err, null, 2)
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            return JSON.stringify(data, null, 2)
        }
    });

}

const getAnswerWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const deleteTable = async (id) => {

    var params = {
        TableName: tableName,
    };
    const response = await dynamodb.deleteTable(params).promise();
    return response
}

//deleteTable()
//createAnswerTable();

module.exports = {
    addNewAnswer,
    getAnswers,
    getAnswersByQuestionId,
    getAnswersByUserId,
    getAnswersByUserIdAndQuestionId,
    deleteAnswer,
    getAnswerWithId,
};