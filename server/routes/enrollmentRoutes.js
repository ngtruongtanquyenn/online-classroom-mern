import express from 'express';
import {
  enrollCourse,
  getMyEnrollments,
  getMyCourseEnrollment,
  markMaterialComplete,
  getCourseStudents,
  removeStudentFromCourse,
} from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/my-enrollments', protect, authorize('student'), getMyEnrollments);
router.get(
  '/course/:courseId/my-enrollment',
  protect,
  authorize('student'),
  getMyCourseEnrollment
);
router.post('/:courseId', protect, authorize('student'), enrollCourse);
router.put(
  '/:courseId/complete-material/:materialId',
  protect,
  authorize('student'),
  markMaterialComplete
);
router.get(
  '/course/:courseId/students',
  protect,
  authorize('teacher', 'admin'),
  getCourseStudents
);

router.delete(
  '/:enrollmentId',
  protect,
  authorize('teacher', 'admin'),
  removeStudentFromCourse
);

export default router;
