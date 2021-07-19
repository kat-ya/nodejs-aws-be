const express = require("express");
require("dotenv").config();
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 3000;

const bffMapper = {
  cart: process.env.cart,
  product: process.env.product,
};

app.use(
  /cart/,
  createProxyMiddleware("**/cart/**", {
    target: bffMapper.cart,
    changeOrigin: true,
  })
);
app.use(
  /product/,
  createProxyMiddleware("**/product/**", {
    target: bffMapper.product,
    changeOrigin: true,
  })
);

app.all("*", (req, res) => {
  return res.status(502).end("Cannot process request");
});

app.listen(port, () => {
  console.log(`BFF service listening at http://localhost:${port}`);
});
