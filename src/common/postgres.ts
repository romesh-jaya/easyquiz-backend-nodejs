const { Pool } = require('pg');
const types = require('pg').types;
const parseTimestampTz = require('postgres-date');
import { attachDatabasePool } from '@vercel/functions';

// Create a connection pool using the connection information provided.
const postgresClient = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  rejectUnauthorized: false,
});

// Attach the pool to ensure idle connections close before suspension
// attachDatabasePool(postgresClient);

// taken from https://github.com/brianc/node-pg-types/blob/master/lib/textParsers.js
const parseTimestamp = function (value: string) {
  const utc = value.endsWith(' BC') ? value.slice(0, -3) + 'Z BC' : value + 'Z';

  return parseTimestampTz(utc);
};

// This is required to prevent pg library automatically converting the TIMESTAMP
// column into the current timezone as per https://stackoverflow.com/a/67475315
types.setTypeParser(1114, function (stringValue: string) {
  return parseTimestamp(stringValue); //1114 for time without timezone type
});

export default postgresClient;
