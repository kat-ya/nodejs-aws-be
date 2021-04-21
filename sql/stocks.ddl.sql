-- stocks:
-- product_id - uuid (foreign key from products.id)
-- count - integer (There are no more products than this count in stock)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS stocks (
  product_id UUID,
  count INTEGER,
  FOREIGN KEY ("product_id") REFERENCES "products" ("id")
);