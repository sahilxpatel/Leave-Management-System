import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password, role, leave_balance FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matches = await bcrypt.compare(password, user.password as string);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      role: user.role,
      name: user.name,
      leaveBalance: user.leave_balance
    });
  } catch (err) {
    console.error('Login failed', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export { login };
