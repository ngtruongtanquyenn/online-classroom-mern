import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Nội dung câu hỏi là bắt buộc'],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length >= 2,
      message: 'Mỗi câu hỏi cần ít nhất 2 đáp án',
    },
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
  },
});

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [Number],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    correctCount: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề bài kiểm tra là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    timeLimit: {
      type: Number,
      default: 15, // Thời gian làm bài (phút)
      min: 1,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: 'Bài kiểm tra cần ít nhất 1 câu hỏi',
      },
    },
    attempts: [attemptSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
