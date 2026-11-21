import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Thống kê tổng quan cho Dashboard Admin
// @route   GET /api/admin/stats
export const getSystemStats = async (req, res, next) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
    ]);

    res.json({ totalUsers, totalCourses, totalEnrollments });
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
    const user = await User.findById(req.params.id);
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

// @desc    Xóa người dùng
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

    await User.findByIdAndDelete(req.params.id);
    // (Tùy chọn) Xóa luôn các khóa học nếu người dùng là giảng viên:
    // await Course.deleteMany({ teacher: req.params.id });

    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (error) {
    next(error);
  }
};