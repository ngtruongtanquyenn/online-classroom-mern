import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['pdf', 'video', 'reading'],
      required: true,
    },
    fileUrl: { type: String },   // Đường dẫn file PDF đã upload
    videoUrl: { type: String },  // Link YouTube/Video
    content: { type: String },   // Nội dung bài đọc (text/markdown)
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tên khóa học là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả khóa học là bắt buộc'],
    },
    category: {
      type: String,
      default: 'Công nghệ thông tin',
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    materials: [materialSchema], // Danh sách tài liệu học tập
    classCode: {
      type: String,
      trim: true,
      default: '', // Để trống = khóa học công khai; có mã = yêu cầu nhập mã khi ghi danh
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);