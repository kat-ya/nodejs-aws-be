"use strict";
const aws = require("aws-sdk");
const csv = require("csv-parser");

exports.importProductsFile = async (event) => {
  try {
    console.log(event);
    const fileName = decodeURIComponent(
      event.queryStringParameters.name
    ).trim();

    if (!fileName.length) {
      throw new Error("Invalid file name");
    }

    const s3 = new aws.S3({ signatureVersion: "v4" });

    const params = {
      Bucket: "rs-app-import-service",
      Key: `uploaded/${fileName}`,
    };

    const url = await s3.getSignedUrlPromise("putObject", params);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(url),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "Internal server error",
    };
  }
};

exports.importFileParser = async (event) => {
  try {
    console.log(event);

    const s3 = new aws.S3();

    const result = await Promise.all(
      event.Records.filter((record) => record.s3).map((record) => {
        const {
          bucket: { name: bucketName },
          object: { key },
        } = record.s3;

        const params = {
          Bucket: bucketName,
          Key: key,
        };
        console.log(params);
        return getCSVObject(params);
      })
    );

    console.log(result);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify("OK"),
    };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: "Internal server error",
    };
  }
};

async function getCSVObject(params) {
  return new Promise((resolve, reject) => {
    const s3 = new aws.S3();
    const readableStream = s3.getObject(params).createReadStream().pipe(csv());
    let rows = [];
    readableStream.on("data", (data) => {
      rows.push(data);
    });
    readableStream.on("end", () => {
      resolve(rows);
    });
    readableStream.on("error", reject);
  });
}
