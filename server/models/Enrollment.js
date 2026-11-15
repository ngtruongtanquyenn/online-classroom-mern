import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedMaterials: [
      {
        type: mongoose.Schema.Types.ObjectId, // Lưu ID của material đã học để tính % tiến trình
      },
    ],
    progress: {
      type: Number,
      default: 0, // Phần trăm hoàn thành (0 - 100)
    },
  },
  { timestamps: true }
);

// Đảm bảo một sinh viên chỉ ghi danh 1 lần vào 1 khóa học
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);