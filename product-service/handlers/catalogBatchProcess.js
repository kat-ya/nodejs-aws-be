'use strict';
const { ProductModel } = require('../models/ProductModel');
const aws = require("aws-sdk");

module.exports.handler = async (event) => {
  let statusCode = 200;
  let result = null;

  try {
    const products = event.Records.map(record => JSON.parse(record.body));
    result = await Promise.all(products.map(ProductModel.create));

    const sns = new aws.SNS();
    const snsResult = await sns.publish({
      Subject: 'catalogBatchProcess successful batch',
      Message: JSON.stringify(result),
      TopicArn: process.env.SNS_ARN
    }).promise();
  } catch (e) {
    statusCode = 400;
    result = e;
  }

  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: statusCode,
    body: JSON.stringify({
      data: result,
    })
  }
}