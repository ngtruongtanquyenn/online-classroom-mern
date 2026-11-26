import express from 'express';
import {
  getAllCourses,
  getTeacherCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addMaterial,
  updateMaterial,
  deleteMaterial,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getAllCourses);
router.get('/my-courses', protect, authorize('teacher'), getTeacherCourses);
router.get('/:id', protect, getCourseById);

router.post('/', protect, authorize('teacher'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

router.post(
  '/:id/materials',
  protect,
  authorize('teacher', 'admin'),
  upload.single('file'),
  addMaterial
);
router.put(
  '/:id/materials/:materialId',
  protect,
  authorize('teacher', 'admin'),
  upload.single('file'),
  updateMaterial
);
router.delete(
  '/:id/materials/:materialId',
  protect,
  authorize('teacher', 'admin'),
  deleteMaterial
);

export default router;
