const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'excercise';

function createExcerciseTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "gameId", AttributeType: "S" },
            { AttributeName: "gameCategoryId", AttributeType: "S" },
            { AttributeName: "level", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "gameId",
                KeySchema:
                    [
                        {
                            AttributeName: "gameId",
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
                IndexName: "gameCategoryId",
                KeySchema:
                    [
                        {
                            AttributeName: "gameCategoryId",
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
                IndexName: "levelAndGameCategoryId",
                KeySchema:
                    [
                        {
                            AttributeName: "gameCategoryId",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "level",
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
            ReadCapacityUnits: 1000,
            WriteCapacityUnits: 1000
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

const addNewExcercise = async (excerciseDetails) => {

    var params = {
        TableName: tableName,
        Item: excerciseDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    console.log(params);

    await docClient.put(params).promise();
    return params.Item.id
}

const getExcercises = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    console.log(response);

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getExcercisesByGameId = async (gameId, startPage, limit) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameId',
        KeyConditionExpression: '#gameId = :gameId',
        ExpressionAttributeNames: {
            '#gameId': 'gameId'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`
        },
        ExclusiveStartKey: startPage,
        Limit: limit,
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getExcercisesByGameCategoryId = async (gameCategoryId, startPage, limit) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameCategoryId',
        KeyConditionExpression: '#gameCategoryId = :gameCategoryId',
        ExpressionAttributeNames: {
            '#gameCategoryId': 'gameCategoryId',
        },
        ExpressionAttributeValues: {
            ':gameCategoryId': `${gameCategoryId}`,
        },
        ExclusiveStartKey: startPage,
        Limit: limit,
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getExcercisesByGameCategoryAndLevel = async (gameCategoryId, level, startPage, limit) => {

    const params = {
        TableName: tableName,
        IndexName: 'levelAndGameCategoryId',
        KeyConditionExpression: '#gameCategoryId = :gameCategoryId AND #level = :level',
        ExpressionAttributeNames: {
            '#gameCategoryId': 'gameCategoryId',
            '#level': 'level'
        },
        ExpressionAttributeValues: {
            ':gameCategoryId': `${gameCategoryId}`,
            ':level': `${level}`
        },
        ExclusiveStartKey: startPage,
        Limit: limit,
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getExcercisesByGameCategoryAndGrade = async (gameCategoryId, grade) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameCategoryId',
        FilterExpression: '#grade = :grade',
        KeyConditionExpression: '#gameCategoryId = :gameCategoryId',
        ExpressionAttributeNames: {
            '#gameCategoryId': 'gameCategoryId',
            '#grade': 'grade',
        },
        ExpressionAttributeValues: {
            ':gameCategoryId': `${gameCategoryId}`,
            ':grade': `${grade}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getExcercisesByGameCategoryAndLevelAndGrade = async (gameCategoryId, level, grade, startPage, limit) => {

    const params = {
        TableName: tableName,
        IndexName: 'levelAndGameCategoryId',
        FilterExpression: '#grade = :grade',
        KeyConditionExpression: '#gameCategoryId = :gameCategoryId AND #level = :level',
        ExpressionAttributeNames: {
            '#gameCategoryId': 'gameCategoryId',
            '#level': 'level',
            '#grade': 'grade',
        },
        ExpressionAttributeValues: {
            ':gameCategoryId': `${gameCategoryId}`,
            ':level': `${level}`,
            ':grade': `${grade}`
        },
        ExclusiveStartKey: startPage,
        Limit: limit,
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getExcerciseById = async (id) => {
    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };
    var response = await docClient.get(params).promise()
    return response.Item
}

const editExcerciseById = async (previousExcercise, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousExcercise.id
        },
        UpdateExpression: `set
            note = :note,
            question = :question,
            option1 = :option1,
            option2 = :option2,
            option3 = :option3,
            option4 = :option4,
            correctAnswer = :correctAnswer,
            timer = :timer,
            updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
            ":note": details.note || previousExcercise.note,
            ":question": details.question || previousExcercise.question,
            ":option1": details.option1 || previousExcercise.option1,
            ":option2": details.option2 || previousExcercise.option2,
            ":option3": details.option3 || previousExcercise.option3,
            ":option4": details.option4 || previousExcercise.option4,
            ":correctAnswer": details.correctAnswer || previousExcercise.correctAnswer,
            ":timer": details.timer || previousExcercise.timer,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };

    var response = await docClient.update(params).promise();
    return response

}

const deleteExcerciseQuestion = async (id) => {

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

// deleteTable()
// createExcerciseTable()

module.exports = {
    addNewExcercise,
    getExcercises,
    getExcercisesByGameId,
    getExcercisesByGameCategoryId,
    getExcercisesByGameCategoryAndLevel,
    getExcercisesByGameCategoryAndGrade,
    getExcercisesByGameCategoryAndLevelAndGrade,
    getExcerciseById,
    editExcerciseById,
    deleteExcerciseQuestion
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
