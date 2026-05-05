import { Request, Response, NextFunction } from 'express';

const requireRole = (role: 'ADMIN' | 'EMPLOYEE') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
};

export { requireRole };
