import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import leaveRoutes from './routes/leaveRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);
app.use('/api', leaveRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error', err);
  res.status(500).json({ message: 'Server error' });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
