CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    name TEXT,
    price INT
);

CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    product_id INT,
    status TEXT
);

INSERT INTO products(name,price) VALUES ('Laptop',50000),('Phone',20000);


