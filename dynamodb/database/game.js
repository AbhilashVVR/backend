const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'games';

function createGameTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
            //{ AttributeName: "gameName", KeyType: "RANGE" },  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "gameName", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "gameName",
                KeySchema:
                    [
                        {
                            AttributeName: "gameName",
                            KeyType: "HASH"
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

const registerNewGame = async (gameDetails) => {

    var params = {
        TableName: tableName,
        Item: gameDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdon = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    await docClient.put(params).promise();
    return params.Item.id
}

const getGames = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getGameWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const getGamesByName = async (gameName) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameName',
        KeyConditionExpression: '#gameName = :gameName',
        ExpressionAttributeNames: {
            '#gameName': 'gameName'
        },
        ExpressionAttributeValues: {
            ':gameName': `${gameName}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}


const editGameById = async (previousGame, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousGame.id
        },

        UpdateExpression: `set 
            gameName = :gameName,
            gameDescription = :gameDescription,
            isEnabled = :isEnabled,
            updatedAt = :updatedAt,
            gameIcon = :gameIcon,
            gameType =:gameType,
            singlePlayer = :singlePlayer,
            multiPlayer = :multiPlayer,
            website =:website,
            dailyCompetition = :dailyCompetition,
            gameStatus = :gameStatus,
            gameVersion = :gameVersion,
            apkLink = :apkLink,
            html5Link = :html5Link,
            appType = :appType,
            fileSize = :fileSize`,
            // uploadVersion = :uploadVersion,
            // actionType = :actionType,
        ExpressionAttributeValues: {
            ":gameName": details.gameName || previousGame.gameName,
            ":gameDescription": details.gameDescription || previousGame.gameDescription,
            ":isEnabled": details.isEnabled,
            ":gameIcon": details.gameIcon || previousGame.gameIcon,
            ":gameType": details.gameType || previousGame.gameType,
            ":singlePlayer": details.singlePlayer,
            ":multiPlayer": details.multiPlayer,
            ":website": details.website,
            ":gameVersion": details.gameVersion || previousGame.gameVersion,
            ":apkLink": details.apkLink || previousGame.apkLink,
            ":appType": details.appType || previousGame.appType,
            ":html5Link": details.html5Link || previousGame.html5Link,
            ":fileSize": details.fileSize || previousGame.fileSize,
            ":dailyCompetition": details.dailyCompetition,
            ":gameStatus" : details.gameStatus,
            ":updatedAt": updatedAt
        },

        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteGame = async (id) => {

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
//createGameTable()

module.exports = {
    registerNewGame,
    getGames,
    getGamesByName,
    getGameWithId,
    editGameById,
    deleteGame,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
