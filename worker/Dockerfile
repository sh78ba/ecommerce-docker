FROM node:18

WORKDIR /app

COPY . .

RUN npm install amqplib pg

CMD ["node","worker.js"]
