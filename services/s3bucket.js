const { s3 } = require('../config');
var fs = require('fs');
var path = require('path');
// Get service clients module and commands using CommonJS syntax.
const { CreateBucketCommand, ListBucketsCommand } = require("@aws-sdk/client-s3");

//call S3 to create the bucket
const createS3Bucket = async () => {
    try {
        // Create the parameters for calling createBucket
        var bucketParams = {
            Bucket: 'lingowways-user-images-bucket'
        };

        // call S3 to create the bucket
        s3.createBucket(bucketParams, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data.Location);
            }
        });
    } catch (err) {
        console.log("Error", err);
    }
};

const listBuckets = async () => {
    var datas = [];
    try {
        // Call S3 to list the buckets
        s3.listBuckets(function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data.Buckets);
                datas = data.Buckets
            }
        });
        console.log("Success", datas);
        return datas
    } catch (err) {
        console.log("Error", err);
    }
};

const uploadApp = async (file) => {
    var urlLink = '';

    var uploadParams = { Bucket: 'lingowways-bucket', Key: '', Body: '' };

    var fileStream = fs.createReadStream(file.path);
    fileStream.on('error', function (err) {
        console.log('File Error', err);
    });

    console.log(file.path);
    console.log(file.name);
    uploadParams.Body = fileStream;
    uploadParams.Key = path.basename(`${file.path}_${file.name}`);

    // call S3 to retrieve upload file to specified bucket
    urlLink = await s3.upload(uploadParams).promise();

    console.log(urlLink);

    return urlLink.Location;
}

const uploadImage = async (file) => {
    var urlLink = '';

    var uploadParams = { Bucket: 'lingowways-user-images-bucket', Key: '', Body: '' };

    var fileStream = fs.createReadStream(file.path);
    fileStream.on('error', function (err) {
        console.log('File Error', err);
    });

    console.log(file);

    uploadParams.Body = fileStream;
    uploadParams.Key = path.basename(`${file.path}_${file.name}`);

    console.log(uploadParams);

    // call S3 to retrieve upload file to specified bucket
    urlLink = await s3.upload(uploadParams).promise();

    console.log(urlLink);

    return urlLink.Location;
}
//createS3Bucket()
//listBuckets()

module.exports = { uploadApp, uploadImage }