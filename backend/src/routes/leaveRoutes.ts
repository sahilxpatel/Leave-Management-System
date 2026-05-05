import { Router } from 'express';
import auth from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} from '../controllers/leaveController';

const router = Router();

router.post('/apply-leave', auth, requireRole('EMPLOYEE'), applyLeave);
router.get('/my-leaves', auth, requireRole('EMPLOYEE'), getMyLeaves);
router.get('/all-leaves', auth, requireRole('ADMIN'), getAllLeaves);
router.put('/leave/:id', auth, requireRole('ADMIN'), updateLeaveStatus);

export default router;
