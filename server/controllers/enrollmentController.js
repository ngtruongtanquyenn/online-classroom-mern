import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';

// @desc    Sinh viên ghi danh vào khóa học
// @route   POST /api/enrollments/:courseId
export const enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Khóa học không tồn tại');
    }

    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });
    if (existing) {
      res.status(400);
      throw new Error('Bạn đã ghi danh khóa học này rồi');
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
    });

    res.status(201).json(enrollment);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách khóa học sinh viên đã ghi danh (kèm tiến trình)
// @route   GET /api/enrollments/my-enrollments
export const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'fullName email' },
      })
      .sort('-createdAt');

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

// @desc    Đánh dấu hoàn thành 1 tài liệu để cập nhật % tiến trình
// @route   PUT /api/enrollments/:courseId/complete-material/:materialId
export const markMaterialComplete = async (req, res, next) => {
  try {
    const { courseId, materialId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });
    if (!enrollment) {
      res.status(404);
      throw new Error('Bạn chưa ghi danh khóa học này');
    }

    const course = await Course.findById(courseId);
    const totalMaterials = course.materials.length;

    if (!enrollment.completedMaterials.includes(materialId)) {
      enrollment.completedMaterials.push(materialId);
    }

    enrollment.progress =
      totalMaterials > 0
        ? Math.round((enrollment.completedMaterials.length / totalMaterials) * 100)
        : 100;

    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    next(error);
  }
};

// @desc    Giảng viên xem danh sách sinh viên đã ghi danh vào khóa học
// @route   GET /api/enrollments/course/:courseId/students
export const getCourseStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Không có quyền xem danh sách sinh viên lớp này');
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'fullName email createdAt')
      .sort('-createdAt');

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa học viên khỏi khóa học (Giảng viên phụ trách hoặc Admin)
// @route   DELETE /api/enrollments/:enrollmentId
export const removeStudentFromCourse = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    if (!enrollment) {
      res.status(404);
      throw new Error('Không tìm thấy thông tin ghi danh của học viên');
    }

    const course = await Course.findById(enrollment.course);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    // Kiểm tra quyền: Chỉ Admin hoặc Giảng viên tạo khóa học mới được xóa
    const isTeacherOwner = course.teacher.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTeacherOwner && !isAdmin) {
      res.status(403);
      throw new Error('Bạn không có quyền xóa học viên khỏi khóa học này');
    }

    // 1. Dọn dẹp luôn bài nộp của học viên này trong các bài tập của khóa học (tránh rác dữ liệu)
    await Assignment.updateMany(
      { course: course._id },
      { $pull: { submissions: { student: enrollment.student } } }
    );

    // 2. Xóa bản ghi ghi danh
    await enrollment.deleteOne();

    res.json({ message: 'Đã xóa học viên khỏi khóa học thành công' });
  } catch (error) {
    next(error);
  }
};