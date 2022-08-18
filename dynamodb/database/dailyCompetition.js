const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");

const tableName = 'dailyCompetition';

function createDailyCompetitionQuestionTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "gameId", AttributeType: "S" },
            { AttributeName: "level", AttributeType: "N" },
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
                IndexName: "levelAndGameId",
                KeySchema:
                    [
                        {
                            AttributeName: "gameId",
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

const registerDailyCompetitionQuestions = async (dailyCompetitionQuestionDetails) => {

    var params = {
        TableName: tableName,
        Item: dailyCompetitionQuestionDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    console.log(params);

    await docClient.put(params).promise();
    return params.Item.id
}

const getDailyCompetitionQuestions = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    console.log("Get category By Id...");
    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getDailyCompetitionQuestionByGameId = async (gameId) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameId',
        KeyConditionExpression: '#gameId = :gameId',
        ExpressionAttributeNames: {
            '#gameId': 'gameId'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getDailyCompetitionQuestionByGradeAndLevelAndGameId = async (gameId, level) => {

    const params = {
        TableName: tableName,
        IndexName: 'levelAndGameId',
        KeyConditionExpression: '#gameId = :gameId AND #level = :level',
        ExpressionAttributeNames: {
            '#gameId': 'gameId',
            '#level': 'level'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`,
            ':level': level
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}


const getDailyCompetitionQuestionById = async (id) => {
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
//createDailyCompetitionQuestionTable()

module.exports = {
    registerDailyCompetitionQuestions,
    getDailyCompetitionQuestions,
    getDailyCompetitionQuestionByGameId,
    getDailyCompetitionQuestionByGradeAndLevelAndGameId,
    getDailyCompetitionQuestionById
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
 