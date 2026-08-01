import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const sqlPath = path.resolve(__dirname, './admin_migration.sql');
  console.log(`Reading SQL migration from ${sqlPath}...`);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    console.log('Running admin migration against database...');
    await pool.query(sql);
    console.log('Admin migration executed successfully!');
  } catch (err) {
    console.error('Error running admin migration:', err);
    process.exit(1);
  } finally {
    await db.close();
  }
}

migrate();
