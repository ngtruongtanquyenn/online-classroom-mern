import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();
await connectDB();

const seedAdmin = async () => {
  try {
    await User.deleteOne({ email: 'admin@classroom.com' });
    await User.create({
      fullName: 'Quản Trị Viên Hệ Thống',
      email: 'admin@classroom.com',
      password: 'password123',
      role: 'admin',
    });
    console.log('Đã tạo thành công: admin@classroom.com / password123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();