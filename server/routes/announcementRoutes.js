import express from 'express';
import {
  getAnnouncementsByCourse,
  createAnnouncement,
  addComment,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/course/:courseId', protect, getAnnouncementsByCourse);
router.post(
  '/course/:courseId',
  protect,
  authorize('teacher', 'admin'),
  createAnnouncement
);
router.post('/:id/comments', protect, addComment);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAnnouncement);

export default router;
