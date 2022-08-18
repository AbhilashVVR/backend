const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'user';

function createUserTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "uniqueId", AttributeType: "S" },
            { AttributeName: "emailToken", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "uniqueId",
                KeySchema:
                    [
                        {
                            AttributeName: "uniqueId",
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
                IndexName: "emailToken",
                KeySchema:
                    [
                        {
                            AttributeName: "emailToken",
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

const addNewUser = async (userDetails) => {

    var params = {
        TableName: tableName,
        Item: userDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.walletCoin = 0;
    params.Item.gameDetails = [];
    params.Item.excerciseDetails = [];
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.resetPasswordToken = null;
    params.Item.resetPasswordExpires = null;
    params.Item.updatedAt = null;
    params.Item.userImage = null;

    await docClient.put(params).promise();
    return params.Item.id
}

const getUsers = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getTotalUsers = async () => {

var params = {
    TableName: tableName,
    Count: true
};

var response = await docClient.scan(params).promise();
return response
}

const getUserById = async (id) => {
    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };
    var response = await docClient.get(params).promise()
    return response.Item
}

const getUserByEmail = async (email) => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    response.Items = response.Items.filter(user => user.email === email);

    return response
}

const getUserByUniqueId = async (uniqueId) => {

    const params = {
        TableName: tableName,
        IndexName: 'uniqueId',
        KeyConditionExpression: '#uniqueId = :uniqueId',
        ExpressionAttributeNames: {
            '#uniqueId': 'uniqueId'
        },
        ExpressionAttributeValues: {
            ':uniqueId': `${uniqueId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getUserByUserName = async (userName) => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    response.Items = response.Items.filter(user => user.userName === userName);

    return response
}

const getUserByEmailToken = async (emailToken) => {

    const params = {
        TableName: tableName,
        IndexName: 'emailToken',
        KeyConditionExpression: '#emailToken = :emailToken',
        ExpressionAttributeNames: {
            '#emailToken': 'emailToken'
        },
        ExpressionAttributeValues: {
            ':emailToken': `${emailToken}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const updateUserById = async (previousUser, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousUser.id
        },

        UpdateExpression: `set 
            firstName = :firstName,
            lastName = :lastName,
            userName = :userName,
            updatedAt = :updatedAt,
            mobileNumber = :mobileNumber,
            email = :email,
            school =:school,
            board = :board,
            grade = :grade,
            pincode = :pincode,
            address = :address,
            userRole = :userRole,
            uniqueId = :uniqueId,
            walletCoin = :walletCoin,
            gameDetails = :gameDetails,
            excerciseDetails = :excerciseDetails,
            isRefered = :isRefered,
            referedBy = :referedBy,
            emailToken = :emailToken,
            isVerified = :isVerified,
            isSocialMedia = :isSocialMedia,
            password = :password,
            userImage = :userImage,
            resetPasswordToken = :resetPasswordToken,
            resetPasswordExpires =:resetPasswordExpires`,
        ExpressionAttributeValues: {
            ":firstName": details.firstName || previousUser.firstName,
            ":lastName": details.lastName || previousUser.lastName,
            ":userName": details.userName || previousUser.userName,
            ":mobileNumber": details.mobileNumber || previousUser.mobileNumber,
            ":email": details.email || previousUser.email,
            ":school": details.school || previousUser.school,
            ":board": details.board || previousUser.board,
            ":grade": details.grade || previousUser.grade,
            ":pincode": details.pincode || previousUser.pincode,
            ":address": details.address || previousUser.address,
            ":userRole": details.userRole || previousUser.userRole,
            ":uniqueId": previousUser.uniqueId,
            ":walletCoin": details.walletCoin,
            ":gameDetails": details.gameDetails || previousUser.gameDetails,
            ":excerciseDetails": details.excerciseDetails || previousUser.excerciseDetails,
            ":isRefered": details.isRefered || previousUser.isRefered,
            ":referedBy": details.referedBy || previousUser.referedBy,
            ":emailToken": details.emailToken || previousUser.emailToken,
            ":isVerified": details.isVerified || previousUser.isVerified,
            ":isSocialMedia": details.isSocialMedia || previousUser.isSocialMedia,
            ":password": details.password || previousUser.password,
            ":userImage": details.userImage || previousUser.userImage,
            ":resetPasswordToken": details.resetPasswordToken || previousUser.resetPasswordToken,
            ":resetPasswordExpires": details.resetPasswordExpires || previousUser.resetPasswordExpires,
            ":updatedAt": updatedAt,

        },

        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteUser = async (id) => {

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
//createUserTable()
// console.log(AWS.config.credentials.accessKeyId);
// console.log(AWS.config.credentials.secretAccessKey);
module.exports = {
    addNewUser,
    getUsers,
    getTotalUsers,
    getUserByEmail,
    getUserByUniqueId,
    getUserByUserName,
    getUserByEmailToken,
    getUserById,
    updateUserById,
    deleteUser
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
