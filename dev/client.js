const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const config = {
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port:     process.env.DB_PORT,
}

// Connect to the database
const client = new Client(config);

client.on('connect', () => {
    console.log(`Connected to the database ${process.env.DB_NAME}`);
  });
  
client.on('remove', () => {
    console.log('Client removed');
    process.exit(0);
});

module.exports = client;