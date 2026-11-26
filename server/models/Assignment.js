import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    textAnswer: { type: String },
    fileUrl: { type: String },
    grade: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    feedback: { type: String, default: '' },
    isLate: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề bài tập là bắt buộc'],
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    submissions: [submissionSchema], // Danh sách bài nộp của sinh viên
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);