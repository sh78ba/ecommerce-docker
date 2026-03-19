const amqp = require(amqplib);
const { Pool } = require("pg");

const pool = new Pool({
  host: "postgres",
  user: "admin",
  password: "admin",
  database: "appdb",
  port: 5432,
});

async function startWorker() {
  const conn = await amqp.connect("amqp://rabbitmq");
  const channel = await conn.createChannel();

  await channel.assertQueue("orders");
  console.log("Worker started");

  channel.consume("orders", async (msg) => {
    const order = JSON.parse(msg.content.toString());
    console.log("Processing order", order.id);

    setTimeout(async () => {
      await pool.query("UPDATE orders SET status='completed' WHERE id = $1", [
        order.id,
      ]);
      console.log("Order completed", order.id);
      channel.ack(msg);
    }, 5000);
  });
}

startWorker();
