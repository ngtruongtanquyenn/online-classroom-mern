import Announcement from '../models/Announcement.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Lấy danh sách thông báo & thảo luận trong khóa học
// @route   GET /api/announcements/course/:courseId
export const getAnnouncementsByCourse = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ course: req.params.courseId })
      .populate('author', 'fullName role avatar')
      .populate('comments.author', 'fullName role avatar')
      .sort('-createdAt');

    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo thông báo / chủ đề thảo luận mới (Teacher phụ trách hoặc Admin)
// @route   POST /api/announcements/course/:courseId
export const createAnnouncement = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Chỉ giảng viên phụ trách hoặc Admin mới có quyền đăng thông báo');
    }

    const { title, content } = req.body;
    const announcement = await Announcement.create({
      course: req.params.courseId,
      author: req.user._id,
      title,
      content,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'fullName role avatar')
      .populate('comments.author', 'fullName role avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm bình luận hỏi đáp vào thông báo
// @route   POST /api/announcements/:id/comments
export const addComment = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      res.status(404);
      throw new Error('Không tìm thấy bài viết');
    }

    const course = await Course.findById(announcement.course);
    const isPrivileged =
      req.user.role === 'admin' ||
      course?.teacher?.toString() === req.user._id.toString();

    if (!isPrivileged) {
      const enrolled = await Enrollment.findOne({
        student: req.user._id,
        course: announcement.course,
      });
      if (!enrolled) {
        res.status(403);
        throw new Error('Bạn cần ghi danh vào lớp để tham gia thảo luận');
      }
    }

    announcement.comments.push({
      author: req.user._id,
      content: req.body.content,
    });

    await announcement.save();

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'fullName role avatar')
      .populate('comments.author', 'fullName role avatar');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa thông báo (Teacher phụ trách hoặc Admin)
// @route   DELETE /api/announcements/:id
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      res.status(404);
      throw new Error('Không tìm thấy thông báo');
    }

    const course = await Course.findById(announcement.course);
    if (
      course?.teacher?.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Không có quyền xóa thông báo này');
    }

    await announcement.deleteOne();
    res.json({ message: 'Đã xóa thông báo' });
  } catch (error) {
    next(error);
  }
};
