const express = require("express");
const { Pool } = require("pg");
const redis = require("redis");
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
const redisClient = redis.createClient({ url: "redis://redis:6379" });
redisClient.connect();

//RabbitMQ
let channel;
async function connectRabbitMQ() {
  while (true) {
    try {
      const conn = await amqp.connect("amqp://rabbitmq");
      channel = await conn.createChannel();
      await channel.assertQueue("orders");
      console.log("Connected to RabbitMQ");
    } catch (err) {
      console.log("Waiting for RabbitMQ...");
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
}
connectRabbitMQ();

//Get Products
app.get("/products", async (req, res) => {
  const cached = await redisClient.get("products");

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const result = await pool.query("SELECT * from products");
  await redisClient.set("products", JSON.stringify(result.rows));
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
