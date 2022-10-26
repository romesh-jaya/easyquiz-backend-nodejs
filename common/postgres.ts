const { Pool } = require('pg');

// Create a connection pool using the connection information provided on bit.io.
const postgresClient = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  ssl: true,
});

export default postgresClient;
