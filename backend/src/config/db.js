import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use standard connection string from env
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ascendiq';

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

class DBProvider {
  constructor() {
    pool.connect((err, client, release) => {
      if (err) {
        console.error('PostgreSQL Connection Error:', err.message);
      } else {
        console.log('Connected to the PostgreSQL/Supabase database successfully.');
        release();
      }
    });
  }

  // Convert SQLite style ? placeholders to PostgreSQL $1, $2, ...
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
    const pgSql = this.convertSql(sql);
    const result = await pool.query(pgSql, params);
    // Mimic sqlite3's .run return structure
    return {
      id: result.insertId || (result.rows && result.rows[0]?.id) || null,
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
