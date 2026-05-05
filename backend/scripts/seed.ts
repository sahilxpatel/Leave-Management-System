import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pool from '../src/db';

dotenv.config();

const users = [
  { name: 'Admin One', email: 'admin1@test.com', password: '123456', role: 'ADMIN' },
  { name: 'Admin Two', email: 'admin2@test.com', password: '123456', role: 'ADMIN' },
  { name: 'Employee One', email: 'emp1@test.com', password: '123456', role: 'EMPLOYEE' },
  { name: 'Employee Two', email: 'emp2@test.com', password: '123456', role: 'EMPLOYEE' }
];

const seed = async () => {
  try {
    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email)
         DO UPDATE SET name = EXCLUDED.name, password = EXCLUDED.password, role = EXCLUDED.role`,
        [user.name, user.email, hash, user.role]
      );
    }

    console.log('Seed completed');
  } catch (err) {
    console.error('Seed failed', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seed();
