import express from 'express';
import {
  getQuizzesByCourse,
  createQuiz,
  submitQuiz,
  deleteQuiz,
} from '../controllers/quizController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/course/:courseId', protect, getQuizzesByCourse);
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);

export default router;
