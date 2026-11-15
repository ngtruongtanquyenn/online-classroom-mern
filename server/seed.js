import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();
await connectDB();

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@classroom.com' });
    if (!adminExists) {
      await User.create({
        fullName: 'Quản Trị Viên Hệ Thống',
        email: 'admin@classroom.com',
        password: 'password123',
        role: 'admin',
      });
      console.log('Đã tạo tài khoản Admin: admin@classroom.com / password123');
    } else {
      console.log('Tài khoản Admin đã tồn tại.');
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();