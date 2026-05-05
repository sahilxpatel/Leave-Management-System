import { Request, Response } from 'express';
import pool from '../db';

const applyLeave = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body as { reason?: string };
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const balanceResult = await pool.query(
      'SELECT leave_balance FROM users WHERE id = $1',
      [userId]
    );
    const balanceRow = balanceResult.rows[0];

    if (!balanceRow) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (balanceRow.leave_balance <= 0) {
      return res.status(400).json({ message: 'No leave balance available' });
    }

    const insertResult = await pool.query(
      'INSERT INTO leaves (user_id, reason, status) VALUES ($1, $2, $3) RETURNING id, user_id, reason, status, created_at',
      [userId, reason.trim(), 'PENDING']
    );

    return res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    console.error('Apply leave failed', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getMyLeaves = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [leavesResult, balanceResult] = await Promise.all([
      pool.query(
        'SELECT id, reason, status, created_at FROM leaves WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      ),
      pool.query('SELECT leave_balance FROM users WHERE id = $1', [userId])
    ]);

    if (balanceResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      balance: balanceResult.rows[0].leave_balance,
      leaves: leavesResult.rows
    });
  } catch (err) {
    console.error('Fetch leaves failed', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllLeaves = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT l.id, l.user_id, u.name, u.email, l.reason, l.status, l.created_at
       FROM leaves l
       JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Fetch all leaves failed', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateLeaveStatus = async (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };
  const leaveId = req.params.id;

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const leaveResult = await client.query(
      `SELECT l.id, l.status, l.user_id, u.leave_balance
       FROM leaves l
       JOIN users u ON u.id = l.user_id
       WHERE l.id = $1
       FOR UPDATE`,
      [leaveId]
    );
    const leave = leaveResult.rows[0];

    if (!leave) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (leave.status !== 'PENDING') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Leave already processed' });
    }

    await client.query('UPDATE leaves SET status = $1 WHERE id = $2', [status, leaveId]);

    if (status === 'APPROVED') {
      if (leave.leave_balance <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Employee has no leave balance' });
      }
      const updateUser = await client.query(
        'UPDATE users SET leave_balance = leave_balance - 1 WHERE id = $1 AND leave_balance > 0',
        [leave.user_id]
      );
      if (updateUser.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Employee has no leave balance' });
      }
    }

    await client.query('COMMIT');

    const updated = await client.query(
      `SELECT l.id, l.user_id, u.name, u.email, l.reason, l.status, l.created_at
       FROM leaves l
       JOIN users u ON u.id = l.user_id
       WHERE l.id = $1`,
      [leaveId]
    );

    return res.json(updated.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update leave failed', err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

export {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
