import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  const schemaPath = path.resolve(__dirname, './schema.sql');
  console.log(`Reading SQL schema from ${schemaPath}...`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    console.log('Initializing schema inside PostgreSQL/Supabase...');
    await pool.query(schemaSql);
    console.log('PostgreSQL schema initialized successfully!');
  } catch (err) {
    console.error('Error executing PostgreSQL database schema:', err);
  } finally {
    await db.close();
  }
}

initDb();
export default initDb;
