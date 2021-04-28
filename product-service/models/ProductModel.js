'use strict';
const { Client } = require('pg');

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

const dbOptions = {
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
      rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
};

class ProductModel {

  static async connect() {
    const client = new Client(dbOptions);
    await client.connect();
    return client;
  }

  static get selectAllQueryStr() {
    return `SELECT products.*, stocks.count FROM products LEFT JOIN stocks ON products.id = stocks.product_id`;
  }

  static async all() {
    const client = await ProductModel.connect();
    try {
      const { rows } = await client.query(ProductModel.selectAllQueryStr); 
      return rows;
    } finally {
      await client.end();
    }
  }

  static async getById(id) {
    const client = await ProductModel.connect();
    try {
      const query = `${ProductModel.selectAllQueryStr} WHERE id=$1`;
      const { rows }= await client.query(query, [id]); 
      if (rows.length) {
        return rows[0];
      }
      return null;
    } finally {
      await client.end();
    }
  }

  static async create(data) {
    const client = await ProductModel.connect();
    try {
      await client.query('BEGIN');

      let { title, description, price, count } = data;
      const productsQuery = 'INSERT INTO products(title, description, price) VALUES($1, $2, $3) RETURNING *';
      const stocksQuery = 'INSERT INTO stocks (product_id, count) VALUES ($1, $2) RETURNING count';

      const { rows: [newProductRow] } = await client.query(productsQuery, [title, description, price]);
     
      if (typeof count !== 'number') {
        count = 0;
      }
      const { rows: [stocksRow] } = await client.query(stocksQuery, [newProductRow.id, count]);

      await client.query('COMMIT');

      return {
        ...newProductRow,
        ...stocksRow,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw new TypeError(e.detail);
    } finally {
      await client.end();
    }
  }
}

module.exports.ProductModel = ProductModel;
