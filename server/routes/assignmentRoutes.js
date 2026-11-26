import express from 'express';
import {
  createAssignment,
  getAssignmentsByCourse,
  getMyUpcomingAssignments,
  submitAssignment,
  gradeSubmission,
  updateAssignment,
  deleteAssignment,
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/my-upcoming', protect, authorize('student'), getMyUpcomingAssignments);
router.post('/', protect, authorize('teacher', 'admin'), createAssignment);
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.post(
  '/:id/submit',
  protect,
  authorize('student'),
  upload.single('file'),
  submitAssignment
);
router.put(
  '/:id/grade/:submissionId',
  protect,
  authorize('teacher', 'admin'),
  gradeSubmission
);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAssignment);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);

export default router;
