This project simulates how a real e-commerce backend ecosystem works behind a simple product page.

Instead of only showing UI + one API, it demonstrates a full request pipeline:

- Frontend serving product list and buy actions
- Nginx reverse proxy for routing web traffic
- Backend API for products and orders
- PostgreSQL for persistent order and product data
- Redis for products caching
- RabbitMQ for asynchronous order processing
- Worker service for background order status updates
