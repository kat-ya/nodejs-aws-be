'use strict';
const { ProductModel } = require('../models/ProductModel');

module.exports.getProductsList = async (event) => {
  console.log(event);
  try {
    const productList = await ProductModel.all();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(
        {
          data: productList
        },
      ),
    };
  } catch (e) {
    console.log(e);
    return serverError();
  }
};

module.exports.getProductsById = async (event) => {
  console.log(event);
  try {
    const { id } = event.pathParameters;
    const product = await ProductModel.getById(id);  
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      statusCode: product ? 200 : 404,
      body: JSON.stringify({
        data: product,
      })
    }
  } catch (e) {
    return serverError();
  }
}

module.exports.createProduct = async (event) => {
  console.log(event);
  let statusCode = 200;
  let payload = null;
  let result = null;

  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    statusCode = 400;
  }

  try {
    result = await ProductModel.create(payload);
  } catch (e) {
    if (!(e instanceof TypeError)) {
      return serverError();
    }
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

function serverError() {
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 500,
    body: JSON.stringify({
      data: 'Internal server error',
    })
  }
}
