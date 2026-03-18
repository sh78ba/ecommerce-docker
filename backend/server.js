const express = require("express");
const { POOL } = require("pg");
const reddis = require("redis");
const amqp = require("amqp");
const { use } = require("react");

const app = express();

app.use(express.json());

const pool = new POOL({
  host: "postgres",
  user: "admin",
  password: "admin",
  database: "appdb",
  port: 5432,
});

//Reddis
const reddisClient = reddis.createClient({ url: "redis//reddis:6379" });
reddisClient.connect();

//RabbitMQ
let channel;
async function connectRabbitMQ() {
  const conn = await amqp.connect("amqp://rabbitmq");
  channel = await conn.createChannel();
  await channel.assertQueue("orders");
}
