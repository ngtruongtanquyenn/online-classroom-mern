import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Quiz from '../models/Quiz.js';
import Announcement from '../models/Announcement.js';

// @desc    Thống kê tổng quan cho Dashboard Admin
// @route   GET /api/admin/stats
export const getSystemStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalAssignments,
      students,
      teachers,
      admins,
      categoryAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Assignment.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'admin' }),
      Course.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const categoryCounts = categoryAgg.map((c) => ({
      category: c._id || 'Khác',
      count: c.count,
    }));

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalAssignments,
      roleCounts: { students, teachers, admins },
      categoryCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách tất cả người dùng
// @route   GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Khóa hoặc Mở khóa tài khoản người dùng
// @route   PUT /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Không thể khóa tài khoản Quản trị viên');
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quản lý danh mục & toàn bộ khóa học trên hệ thống
// @route   GET /api/admin/courses
export const getAllCoursesAdmin = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'fullName email')
      .sort('-createdAt');
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa người dùng và dọn dẹp dữ liệu liên quan
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }

    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Không thể xóa tài khoản Quản trị viên');
    }

    const teacherCourses = await Course.find({ teacher: req.params.id }).select('_id');
    const teacherCourseIds = teacherCourses.map((c) => c._id);

    await Promise.all([
      Enrollment.deleteMany({
        $or: [
          { student: req.params.id },
          { course: { $in: teacherCourseIds } },
        ],
      }),
      Assignment.deleteMany({ course: { $in: teacherCourseIds } }),
      Assignment.updateMany({}, { $pull: { submissions: { student: req.params.id } } }),
      Quiz.deleteMany({ course: { $in: teacherCourseIds } }),
      Quiz.updateMany({}, { $pull: { attempts: { student: req.params.id } } }),
      Announcement.deleteMany({
        $or: [
          { course: { $in: teacherCourseIds } },
          { author: req.params.id },
        ],
      }),
      Course.deleteMany({ teacher: req.params.id }),
      User.findByIdAndDelete(req.params.id),
    ]);

    res.json({ message: 'Đã xóa người dùng và dữ liệu liên quan thành công' });
  } catch (error) {
    next(error);
  }
};
