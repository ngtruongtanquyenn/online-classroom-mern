import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('Email đã được sử dụng');
    }

    // Chỉ cho phép đăng ký role teacher hoặc student (tránh tự tạo admin)
    const assignedRole = ['teacher', 'student'].includes(role) ? role : 'student';

    const user = await User.create({
      fullName,
      email,
      password,
      role: assignedRole,
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      bio: user.bio || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng nhập & lấy JWT
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('Tài khoản đã bị quản trị viên khóa');
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      bio: user.bio || '',
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy thông tin người dùng hiện tại
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Cập nhật hồ sơ cá nhân (Họ tên, giới thiệu, ảnh đại diện)
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('Không tìm thấy người dùng');
    }

    const { fullName, bio } = req.body;
    if (fullName !== undefined && fullName.trim()) {
      user.fullName = fullName.trim();
    }
    if (bio !== undefined) {
      user.bio = bio;
    }
    if (req.file) {
      user.avatar = req.file.path;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar || '',
      bio: updated.bio || '',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đổi mật khẩu tài khoản hiện tại
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400);
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const user = await User.findById(req.user._id);
    if (!user || !(await user.matchPassword(currentPassword))) {
      res.status(400);
      throw new Error('Mật khẩu hiện tại không chính xác');
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    next(error);
  }
};
