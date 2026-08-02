import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const sqlPath = path.resolve(__dirname, './learning_engine_migration.sql');
  console.log(`Reading SQL migration from ${sqlPath}...`);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    console.log('Running course learning engine migration against database...');
    await pool.query(sql);
    console.log('Course learning engine migration executed successfully!');
  } catch (err) {
    console.error('Error running learning migration:', err);
    process.exit(1);
  } finally {
    await db.close();
  }
}

migrate();
