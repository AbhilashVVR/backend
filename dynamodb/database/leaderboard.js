const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'leaderboard';

function createLeaderBoardTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "gameId", AttributeType: "S" },
            { AttributeName: "userId", AttributeType: "S" },
            { AttributeName: "scoreDate", AttributeType: "N" },
            { AttributeName: "week", AttributeType: "N" },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "userIdAndGameId",
                KeySchema:
                    [
                        {
                            AttributeName: "gameId",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "userId",
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
                IndexName: "gameIdAndScoreDate",
                KeySchema:
                    [
                        {
                            AttributeName: "gameId",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "scoreDate",
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
                IndexName: "weekAndgameId",
                KeySchema:
                    [
                        {
                            AttributeName: "gameId",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "week",
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

const addNewLeaderBoard = async (leaderBoardDetails) => {

    var params = {
        TableName: tableName,
        Item: leaderBoardDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    await docClient.put(params).promise();
    return params.Item.id
}

const getLeaderBoards = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();
    return response
}

const getLeaderBoardByUserIdAndGameId = async (userId, gameId) => {

    const params = {
        TableName: tableName,
        IndexName: 'userIdAndGameId',
        KeyConditionExpression: '#gameId = :gameId AND #userId = :userId',
        ExpressionAttributeNames: {
            '#gameId': 'gameId',
            '#userId': 'userId'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`,
            ':userId': `${userId}`
        }
    };

    var response = await docClient.query(params).promise();
    return response
}

const getDailyLeaderBoardByGameId = async (gameId, scoreDate, scoreMonth, scoreYear) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameIdAndScoreDate',
        FilterExpression: '#scoreYear = :scoreYear AND #scoreMonth = :scoreMonth',
        KeyConditionExpression: '#gameId = :gameId AND #scoreDate = :scoreDate',
        ExpressionAttributeNames: {
            '#gameId': 'gameId',
            '#scoreDate': 'scoreDate',
            '#scoreYear': 'scoreYear',
            '#scoreMonth': 'scoreMonth'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`,
            ':scoreDate': scoreDate,
            ':scoreYear': scoreYear,
            ':scoreMonth': scoreMonth
        }
    };

    var response = await docClient.query(params).promise();
    return response
}

const getWeeklyLeaderBoardByGameId = async (gameId, week) => {

    const params = {
        TableName: tableName,
        IndexName: 'weekAndgameId',
        KeyConditionExpression: '#gameId = :gameId AND #week= :week',
        ExpressionAttributeNames: {
            '#gameId': 'gameId',
            '#week': 'week'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`,
            ':week': week
        }
    };

    var response = await docClient.query(params).promise();
    return response
}

const getLifetimeLeaderBoardByGameId = async (gameId) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameId',
        KeyConditionExpression: '#gameId = :gameId',
        ExpressionAttributeNames: {
            '#gameId': 'gameId',
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`,
        }
    };

    var response = await docClient.query(params).promise();
    return response
}

const getLeaderBoardById = async (id) => {
    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };
    var response = await docClient.get(params).promise()
    return response.Item
}

const updateLeaderBoardById = async (previousLeaderBoard, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00
    
    var params = {
        TableName: tableName,
        Key: {
            "id": previousLeaderBoard.id
        },

        UpdateExpression: `set 
            userId = :userId,
            userName = :userName,
            usermail = :email,
            gameId =:gameId,
            score = :score,
            scoreDate = :scoreDate,
            scoreMonth = :scoreMonth,
            scoreYear = :scoreYear,
            week = :week,
            updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
            ":userId": details.userId || previousLeaderBoard.userId,
            ":userName": details.userName || previousLeaderBoard.userName,
            ":email": details.email || previousLeaderBoard.email,
            ":gameId": details.gameId || previousLeaderBoard.gameId,
            ":score": details.score || previousLeaderBoard.score,
            ":scoreDate": details.scoreDate || previousLeaderBoard.scoreDate,
            ":scoreMonth": details.scoreMonth || previousLeaderBoard.scoreMonth,
            ":scoreYear": details.scoreYear || previousLeaderBoard.scoreYear,
            ":week": details.week || previousLeaderBoard.week,
            ":updatedAt": updatedAt
        },

        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteLeaderBoard = async (id) => {

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
//createLeaderBoardTable()

module.exports = {
    addNewLeaderBoard,
    getLeaderBoards,
    getLeaderBoardByUserIdAndGameId,
    getDailyLeaderBoardByGameId,
    getWeeklyLeaderBoardByGameId,
    getLifetimeLeaderBoardByGameId,
    getLeaderBoardById,
    updateLeaderBoardById,
    deleteLeaderBoard
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
