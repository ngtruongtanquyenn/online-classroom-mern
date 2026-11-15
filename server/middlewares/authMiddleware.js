import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Xác thực token người dùng
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Không tìm thấy người dùng' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  } else {
    return res.status(401).json({ message: 'Không có quyền truy cập, thiếu Token' });
  }
};

// Phân quyền theo vai trò (admin, teacher, student)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Vai trò (${req.user.role}) không được phép thực hiện chức năng này`,
      });
    }
    next();
  };
};