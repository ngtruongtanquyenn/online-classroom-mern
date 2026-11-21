import express from 'express';
import {
  getSystemStats,
  getAllUsers,
  toggleUserStatus,
  getAllCoursesAdmin,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCoursesAdmin);

export default router;