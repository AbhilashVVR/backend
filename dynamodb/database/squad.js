const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'squad';

function createSquadTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" } //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "name", AttributeType: "S" },
            { AttributeName: "userId", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "userIdAndName",
                KeySchema:
                    [
                        {
                            AttributeName: "name",
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

const addNewSquad = async (squadDetails) => {

    var params = {
        TableName: tableName,
        Item: squadDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    await docClient.put(params).promise();
    return params.Item.id
}

const getSquads = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getSquadsByNameAndUserId = async (name, userId) => {

    const params = {
        TableName: tableName,
        IndexName: 'userIdAndName',
        KeyConditionExpression: '#name = :name AND #userId = :userId',
        ExpressionAttributeNames: {
            '#name': 'name',
            '#userId': 'userId'
        },
        ExpressionAttributeValues: {
            ':name': `${name}`,
            ':userId': `${userId}`
        }
    };

    console.log(params)
    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getSquadWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const editSquadById = async (previousSquad, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousSquad.id
        },
        UpdateExpression: "set squadMember = :squadMember, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
            ":squadMember": details.squadMember || previousSquad.squadMember,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteSquad = async (id) => {

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
//createSquadTable()

module.exports = {
    addNewSquad,
    getSquads,
    getSquadsByNameAndUserId,
    getSquadWithId,
    editSquadById,
    deleteSquad,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
