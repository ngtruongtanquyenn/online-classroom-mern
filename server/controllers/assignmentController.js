import Assignment from '../models/Assignment.js';
import Course from '../models/Course.js';

// @desc    Giảng viên tạo bài tập mới trong khóa học
// @route   POST /api/assignments
export const createAssignment = async (req, res, next) => {
  try {
    const { courseId, title, description, dueDate } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Bạn không phải giảng viên của khóa học này');
    }

    const assignment = await Assignment.create({
      course: courseId,
      title,
      description,
      dueDate,
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách bài tập của một khóa học
// @route   GET /api/assignments/course/:courseId
export const getAssignmentsByCourse = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('submissions.student', 'fullName email')
      .sort('-createdAt');

    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Sinh viên nộp bài tập (Upload file hoặc text)
// @route   POST /api/assignments/:id/submit
export const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error('Không tìm thấy bài tập');
    }

    const { textAnswer } = req.body;
    const fileUrl = req.file ? req.file.path : undefined;

    if (!textAnswer && !fileUrl) {
      res.status(400);
      throw new Error('Vui lòng nhập nội dung hoặc đính kèm tệp bài làm');
    }

    const existingIndex = assignment.submissions.findIndex(
      (sub) => sub.student.toString() === req.user._id.toString()
    );

    if (existingIndex !== -1) {
      assignment.submissions[existingIndex].textAnswer = textAnswer;
      if (fileUrl) assignment.submissions[existingIndex].fileUrl = fileUrl;
      assignment.submissions[existingIndex].submittedAt = Date.now();
    } else {
      assignment.submissions.push({
        student: req.user._id,
        textAnswer,
        fileUrl,
      });
    }

    await assignment.save();
    res.json({ message: 'Nộp bài thành công', assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Giảng viên chấm điểm bài nộp của sinh viên
// @route   PUT /api/assignments/:id/grade/:submissionId
export const gradeSubmission = async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('course');

    if (!assignment) {
      res.status(404);
      throw new Error('Không tìm thấy bài tập');
    }

    if (assignment.course.teacher.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Không có quyền chấm điểm bài tập này');
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      res.status(404);
      throw new Error('Không tìm thấy bài nộp của sinh viên');
    }

    submission.grade = grade;
    submission.feedback = feedback || '';

    await assignment.save();
    res.json({ message: 'Đã lưu điểm thành công', submission });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thông tin bài tập (Teacher sở hữu khóa học hoặc Admin)
// @route   PUT /api/assignments/:id
export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error('Không tìm thấy bài tập');
    }

    const course = await Course.findById(assignment.course);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Bạn không có quyền chỉnh sửa bài tập này');
    }

    const { title, description, dueDate } = req.body;
    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;

    const updated = await assignment.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa bài tập (Teacher sở hữu khóa học hoặc Admin)
// @route   DELETE /api/assignments/:id
export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error('Không tìm thấy bài tập');
    }

    const course = await Course.findById(assignment.course);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Bạn không có quyền xóa bài tập này');
    }

    await assignment.deleteOne();
    res.json({ message: 'Đã xóa bài tập thành công' });
  } catch (error) {
    next(error);
  }
};