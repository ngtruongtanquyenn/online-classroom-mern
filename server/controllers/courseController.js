import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Lấy danh sách tất cả khóa học đang mở
// @route   GET /api/courses
export const getAllCourses = async (req, res, next) => {
  try {
    const { keyword, category } = req.query;
    const query = { isPublished: true };

    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const courses = await Course.find(query)
      .populate('teacher', 'fullName email')
      .select('-materials.content')
      .sort('-createdAt');

    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách khóa học của Giảng viên đang đăng nhập
// @route   GET /api/courses/my-courses
export const getTeacherCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ teacher: req.user._id }).sort('-createdAt');
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// @desc    Xem chi tiết một khóa học
// @route   GET /api/courses/:id
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'teacher',
      'fullName email'
    );
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }
    res.json(course);
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo khóa học mới (Teacher)
// @route   POST /api/courses
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const course = await Course.create({
      title,
      description,
      category,
      teacher: req.user._id,
    });
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật khóa học (Teacher sở hữu)
// @route   PUT /api/courses/:id
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Bạn không có quyền chỉnh sửa khóa học này');
    }

    const { title, description, category, isPublished } = req.body;
    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    if (typeof isPublished === 'boolean') course.isPublished = isPublished;

    const updated = await course.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa khóa học (Teacher sở hữu hoặc Admin)
// @route   DELETE /api/courses/:id
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Không có quyền xóa khóa học này');
    }

    await course.deleteOne();
    await Enrollment.deleteMany({ course: req.params.id });
    res.json({ message: 'Đã xóa khóa học thành công' });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng tải tài liệu vào khóa học (Cloudinary URL, Video link, Bài đọc)
// @route   POST /api/courses/:id/materials
export const addMaterial = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Không có quyền thêm tài liệu');
    }

    const { title, type, videoUrl, content } = req.body;
    const fileUrl = req.file ? req.file.path : undefined;

    course.materials.push({
      title,
      type,
      fileUrl,
      videoUrl,
      content,
    });

    await course.save();
    res.status(201).json(course.materials);
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật tài liệu trong khóa học
// @route   PUT /api/courses/:id/materials/:materialId
export const updateMaterial = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Không có quyền chỉnh sửa tài liệu');
    }

    const material = course.materials.id(req.params.materialId);
    if (!material) {
      res.status(404);
      throw new Error('Không tìm thấy tài liệu');
    }

    const { title, type, videoUrl, content } = req.body;
    if (title !== undefined) material.title = title;
    if (type !== undefined) material.type = type;
    if (videoUrl !== undefined) material.videoUrl = videoUrl;
    if (content !== undefined) material.content = content;
    if (req.file) {
      material.fileUrl = req.file.path;
    }

    await course.save();
    res.json(course.materials);
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa tài liệu khỏi khóa học
// @route   DELETE /api/courses/:id/materials/:materialId
export const deleteMaterial = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      throw new Error('Không tìm thấy khóa học');
    }

    if (
      course.teacher.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Không có quyền xóa tài liệu');
    }

    course.materials = course.materials.filter(
      (m) => m._id.toString() !== req.params.materialId
    );
    await course.save();
    res.json({ message: 'Đã xóa tài liệu' });
  } catch (error) {
    next(error);
  }
};