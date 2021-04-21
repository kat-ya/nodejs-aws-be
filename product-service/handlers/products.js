'use strict';
const productsList = require('../products.json');

module.exports.getProductsList = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(
      {
        data: productsList
      },
    ),
  };
};

module.exports.getProductsById = async (event) => {
  const { id } = event.pathParameters;
  const product = productsList.find(productItem => productItem.id === id) || null;
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
    statusCode: product ? 200 : 404,
    body: JSON.stringify({
      data: product,
    })
  }
}