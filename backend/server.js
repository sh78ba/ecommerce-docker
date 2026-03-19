const express = require("express");
const { Pool } = require("pg");
const reddis = require("redis");
const amqp = require("amqplib");

const app = express();

app.use(express.json());

const pool = new Pool({
  host: "postgres",
  user: "admin",
  password: "admin",
  database: "appdb",
  port: 5432,
});

//Reddis
const reddisClient = reddis.createClient({ url: "redis://reddis:6379" });
reddisClient.connect();

//RabbitMQ
let channel;
async function connectRabbitMQ() {
  const conn = await amqp.connect("amqp://rabbitmq");
  channel = await conn.createChannel();
  await channel.assertQueue("orders");
}
connectRabbitMQ();

//Get Products
app.get("/products", async (req, res) => {
  const cached = await reddisClient.get("products");

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const result = await pool.query("SELECT * from products");
  await reddisClient.set("products", JSON.stringify(result.rows));
  res.json(JSON.parse(result.rows));
});

// POST order

app.post("/order", async (req, res) => {
  const { product_id } = req.body;
  const result = await pool.query(
    "INSERT INTO orders(products_id, status) VALUES($1, $2) RETURNING *",
    [product_id, "pending"],
  );

  //send to queue
  channel.sendToQueue("orders", Buffer.from(JSON.stringify(result.rows[0])));

  res.json({ message: "Order Placed Successfully", order: result.row[0] });
});

app.listen(5001, () => {
  console.log("Backend Running on 5001");
});
