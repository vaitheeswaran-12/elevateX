import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'CRITICAL DATABASE ERROR: process.env.DATABASE_URL is not defined! ' +
    'Please configure a valid PostgreSQL connection string inside your env environment files.'
  );
}

const pool = new Pool({
  connectionString,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONN_TIMEOUT || '2000', 10),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Centralized Pool Connection Error Listening
pool.on('error', (err, client) => {
  console.error('CRITICAL: Unexpected client error in active PostgreSQL pool connection:', err.message);
});

class DBProvider {
  constructor() {
    pool.connect((err, client, release) => {
      if (err) {
        console.error('PostgreSQL Connection Hook Failure:', err.message);
      } else {
        console.log('PostgreSQL Connection Hook Established Successfully.');
        release();
      }
    });
  }

  // Converts standard ? parameter markers to PostgreSQL numeric markers ($1, $2, ...)
  convertSql(sql) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  async all(sql, params = []) {
    const pgSql = this.convertSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows;
  }

  async get(sql, params = []) {
    const pgSql = this.convertSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows[0] || null;
  }

  async run(sql, params = []) {
    let pgSql = this.convertSql(sql);

    // Support RETURNING id dynamically on SQL INSERT statements to read inserted IDs safely and natively
    const trimmed = pgSql.trim().toUpperCase();
    if (trimmed.startsWith('INSERT') && !trimmed.includes('RETURNING')) {
      pgSql += ' RETURNING id';
    }

    const result = await pool.query(pgSql, params);

    return {
      id: (result.rows && result.rows[0]?.id) || null,
      changes: result.rowCount
    };
  }

  async close() {
    await pool.end();
  }
}

const db = new DBProvider();
export default db;
export { pool };
