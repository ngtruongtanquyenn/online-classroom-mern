import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Lấy danh sách bài kiểm tra trắc nghiệm của khóa học
// @route   GET /api/quizzes/course/:courseId
export const getQuizzesByCourse = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId })
      .populate('attempts.student', 'fullName email')
      .sort('-createdAt');

    if (req.user.role === 'student') {
      const sanitized = quizzes.map((quiz) => {
        const obj = quiz.toObject();
        const myAttempt = (obj.attempts || []).find(
          (a) => a.student?._id?.toString() === req.user._id.toString()
        );
        obj.myAttempt = myAttempt || null;
        delete obj.attempts;

        // Chỉ trả về đáp án đúng sau khi sinh viên đã nộp bài
        if (!myAttempt) {
          obj.questions = obj.questions.map(({ questionText, options, _id }) => ({
            _id,
            questionText,
            options,
          }));
        }
        return obj;
      });
      return res.json(sanitized);
    }

    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo bài kiểm tra trắc nghiệm mới (Teacher hoặc Admin)
// @route   POST /api/quizzes
export const createQuiz = async (req, res, next) => {
  try {
    const { courseId, title, description, timeLimit, questions } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Bạn không có quyền tạo bài kiểm tra cho lớp này');
    }

    const quiz = await Quiz.create({
      course: courseId,
      title,
      description,
      timeLimit: Number(timeLimit) || 15,
      questions,
    });

    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Sinh viên nộp bài trắc nghiệm (tự động chấm điểm)
// @route   POST /api/quizzes/:id/submit
export const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      res.status(404);
      throw new Error('Không tìm thấy bài kiểm tra');
    }

    const enrolled = await Enrollment.findOne({
      student: req.user._id,
      course: quiz.course,
    });
    if (!enrolled) {
      res.status(403);
      throw new Error('Bạn cần ghi danh vào khóa học trước khi làm bài');
    }

    const { answers = [] } = req.body;
    const totalQuestions = quiz.questions.length;
    let correctCount = 0;

    quiz.questions.forEach((q, idx) => {
      if (Number(answers[idx]) === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100) / 10
        : 0;

    const existingIndex = quiz.attempts.findIndex(
      (a) => a.student.toString() === req.user._id.toString()
    );

    const attemptPayload = {
      student: req.user._id,
      answers,
      score,
      correctCount,
      totalQuestions,
      submittedAt: Date.now(),
    };

    if (existingIndex !== -1) {
      quiz.attempts[existingIndex] = attemptPayload;
    } else {
      quiz.attempts.push(attemptPayload);
    }

    await quiz.save();

    res.json({
      message: `Hoàn thành bài kiểm tra! Điểm của bạn: ${score}/10`,
      myAttempt: attemptPayload,
      questions: quiz.questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa bài kiểm tra (Teacher hoặc Admin)
// @route   DELETE /api/quizzes/:id
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      res.status(404);
      throw new Error('Không tìm thấy bài kiểm tra');
    }

    const course = await Course.findById(quiz.course);
    if (
      course?.teacher?.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Không có quyền xóa bài kiểm tra này');
    }

    await quiz.deleteOne();
    res.json({ message: 'Đã xóa bài kiểm tra' });
  } catch (error) {
    next(error);
  }
};
