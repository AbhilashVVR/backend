const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'subcategory';

function createSubCategoryTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "categoryId", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "categoryId",
                KeySchema:
                    [
                        {
                            AttributeName: "categoryId",
                            KeyType: "HASH"
                        }
                    ],
                Projection:
                    { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 1000,
                    WriteCapacityUnits: 1000
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

const addNewSubCategory = async (subCategoryDetails) => {
    console.log(subCategoryDetails);

    var params = {
        TableName: tableName,
        Item: subCategoryDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    await docClient.put(params).promise();
    return params.Item.id
}

const getSubCategories = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    console.log("Get subCategory By Id...");
    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getSubCategoriesByCategoryId = async (categoryId) => {

    const params = {
        TableName: tableName,
        IndexName: 'categoryId',
        KeyConditionExpression: '#categoryId = :categoryId',
        ExpressionAttributeNames: {
            '#categoryId': 'categoryId'
        },
        ExpressionAttributeValues: {
            ':categoryId': `${categoryId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const deleteSubCategory = async (id) => {

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

    console.log("Attempting a conditional delete...");
    const response = await docClient.delete(params).promise();

    return response

}

const getSubCategoryWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const editSubCategoryById = async (previousSubCategory, details) => {

    console.log(details);

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousSubCategory.id
        },
        UpdateExpression: `set
            subCategoryName = :subCategoryName,
            subCategoryGrades = :subCategoryGrades,
            categoryId = :categoryId,
            isEnabled = :isEnabled,
            updatedAt =:updatedAt`,
        ExpressionAttributeValues: {
            ":subCategoryName": details.subCategoryName || previousSubCategory.subCategoryName,
            ":subCategoryGrades": details.subCategoryGrades || previousSubCategory.subCategoryGrades,
            ":categoryId": previousSubCategory.categoryId,
            ":isEnabled": details.isEnabled,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteTable = async (id) => {

    var params = {
        TableName: tableName,
    };
    const response = await dynamodb.deleteTable(params).promise();

    return response

}

//deleteTable()
//createSubCategoryTable()

module.exports = {
    addNewSubCategory,
    getSubCategories,
    getSubCategoriesByCategoryId,
    deleteSubCategory,
    getSubCategoryWithId,
    editSubCategoryById
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
