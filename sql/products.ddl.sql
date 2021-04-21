-- products:
-- id - uuid (primary key)
-- title - text, not null
-- description - text
-- price - integer
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER
);