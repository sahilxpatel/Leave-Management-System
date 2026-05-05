import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pool from '../src/db';

dotenv.config();

const run = async () => {
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    await pool.query(schemaSql);
    console.log('Schema applied successfully');
  } catch (err) {
    console.error('Schema apply failed', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
