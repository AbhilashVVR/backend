const AWS = require("aws-sdk");
const { S3Client } = require("@aws-sdk/client-s3");


// Set the AWS Region.
const REGION = "ap-south-1"; //e.g. "us-east-1"

AWS.config.update({
    region: REGION,
    accessKeyId: "AKIAUHGCFUEZLQTCXGWO",
    secretAccessKey: "774OEPlWrCZvYUQJh4SPwTsiePlqAxGE2I9lsnJ0"
    //endpoint: "http://localhost:8000"
});
const dynamodb = new AWS.DynamoDB({ correctClockSkew: true });
const docClient = new AWS.DynamoDB.DocumentClient();

console.log("DynamoDb Connected")


// Create S3 service object
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = {
    dynamodb,
    docClient,
    s3
}