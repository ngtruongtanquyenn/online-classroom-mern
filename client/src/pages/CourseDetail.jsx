import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CourseQuizzesTab from '../components/CourseQuizzesTab';
import CourseDiscussionTab from '../components/CourseDiscussionTab';
import CourseGradebookTab from '../components/CourseGradebookTab';
import {
  FileText,
  Video,
  BookOpen,
  CheckCircle,
  Pencil,
  Trash2,
  Users,
  ClipboardList,
  ArrowLeft,
  Plus,
  Calendar,
  Upload,
  ExternalLink,
  Award,
  Layers,
  HelpCircle,
  MessageSquare,
  Table,
  PlayCircle,
  Eye,
  X,
} from 'lucide-react';

function getYoutubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast, confirm } = useToast();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [myEnrollment, setMyEnrollment] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');

  // State chỉnh sửa khóa học (Teacher sở hữu hoặc Admin)
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: '',
    description: '',
    classCode: '',
  });
  const [savingCourse, setSavingCourse] = useState(false);

  // State xem trước Video / PDF inline
  const [openVideoId, setOpenVideoId] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);

  // State form thêm tài liệu (Teacher / Admin)
  const [matForm, setMatForm] = useState({
    title: '',
    type: 'pdf',
    videoUrl: '',
    content: '',
  });
  const [matFile, setMatFile] = useState(null);

  // State chỉnh sửa tài liệu (Teacher / Admin)
  const [editingMatId, setEditingMatId] = useState(null);
  const [editMatForm, setEditMatForm] = useState({
    title: '',
    type: 'pdf',
    videoUrl: '',
    content: '',
  });
  const [editMatFile, setEditMatFile] = useState(null);

  // State form tạo bài tập (Teacher / Admin)
  const [assignForm, setAssignForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  // State chỉnh sửa bài tập (Teacher / Admin)
  const [editingAssignId, setEditingAssignId] = useState(null);
  const [editAssignForm, setEditAssignForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  // State nộp bài (Student)
  const [submitText, setSubmitText] = useState({});
  const [submitFile, setSubmitFile] = useState({});

  // State chấm điểm inline (Teacher / Admin)
  const [gradingSubId, setGradingSubId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

  const isTeacherOwner =
    (user?.role === 'teacher' && course?.teacher?._id === user?._id) ||
    user?.role === 'admin';

  // Hàm chuẩn hóa URL file (hỗ trợ cả link Cloudinary https:// và link /uploads cũ)
  const getFileUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  const loadData = async () => {
    const [courseRes, assignRes, quizRes, annRes] = await Promise.all([
      axiosClient.get(`/courses/${id}`),
      axiosClient.get(`/assignments/course/${id}`),
      axiosClient.get(`/quizzes/course/${id}`),
      axiosClient.get(`/announcements/course/${id}`),
    ]);
    setCourse(courseRes.data);
    setAssignments(assignRes.data);
    setQuizzes(quizRes.data);
    setAnnouncements(annRes.data);

    if (user?.role === 'teacher' || user?.role === 'admin') {
      const stuRes = await axiosClient.get(`/enrollments/course/${id}/students`);
      setStudents(stuRes.data);
    } else if (user?.role === 'student') {
      const myRes = await axiosClient.get(`/enrollments/course/${id}/my-enrollment`);
      setMyEnrollment(myRes.data);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Admin / Teacher sở hữu: Chỉnh sửa thông tin khóa học
  const startEditCourse = () => {
    setCourseForm({
      title: course.title || '',
      category: course.category || '',
      description: course.description || '',
      classCode: course.classCode || '',
    });
    setIsEditingCourse(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      await axiosClient.put(`/courses/${id}`, courseForm);
      setIsEditingCourse(false);
      toast.success('Đã cập nhật thông tin khóa học');
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật khóa học');
    } finally {
      setSavingCourse(false);
    }
  };

  // Teacher / Admin: Thêm tài liệu
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', matForm.title);
      formData.append('type', matForm.type);
      if (matForm.type === 'video') formData.append('videoUrl', matForm.videoUrl);
      if (matForm.type === 'reading') formData.append('content', matForm.content);
      if (matForm.type === 'pdf' && matFile) formData.append('file', matFile);

      await axiosClient.post(`/courses/${id}/materials`, formData);
      setMatForm({ title: '', type: 'pdf', videoUrl: '', content: '' });
      setMatFile(null);
      toast.success('Đã thêm tài liệu mới');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm tài liệu');
    }
  };

  // Teacher / Admin: Bật chế độ sửa tài liệu
  const startEditMaterial = (material) => {
    setEditingMatId(material._id);
    setEditMatForm({
      title: material.title || '',
      type: material.type || 'pdf',
      videoUrl: material.videoUrl || '',
      content: material.content || '',
    });
    setEditMatFile(null);
  };

  // Teacher / Admin: Lưu cập nhật tài liệu
  const handleUpdateMaterial = async (e, materialId) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editMatForm.title);
      formData.append('type', editMatForm.type);
      if (editMatForm.type === 'video') formData.append('videoUrl', editMatForm.videoUrl);
      if (editMatForm.type === 'reading') formData.append('content', editMatForm.content);
      if (editMatForm.type === 'pdf' && editMatFile) formData.append('file', editMatFile);

      await axiosClient.put(`/courses/${id}/materials/${materialId}`, formData);
      setEditingMatId(null);
      setEditMatFile(null);
      toast.success('Đã cập nhật tài liệu');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật tài liệu');
    }
  };

  // Teacher / Admin: Xóa tài liệu
  const handleDeleteMaterial = async (materialId, title) => {
    const ok = await confirm({
      title: 'Xóa tài liệu',
      message: `Bạn có chắc muốn xóa tài liệu "${title}"?`,
      confirmText: 'Xóa tài liệu',
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/courses/${id}/materials/${materialId}`);
      toast.success('Đã xóa tài liệu');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa tài liệu');
    }
  };

  // Student: Đánh dấu hoàn thành tài liệu
  const handleCompleteMaterial = async (materialId) => {
    try {
      const { data } = await axiosClient.put(
        `/enrollments/${id}/complete-material/${materialId}`
      );
      setMyEnrollment(data);
      toast.success(`Đã cập nhật tiến độ học tập: ${data.progress}%`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật tiến độ');
    }
  };

  // Teacher / Admin: Tạo bài tập
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/assignments', { ...assignForm, courseId: id });
      setAssignForm({ title: '', description: '', dueDate: '' });
      toast.success('Đã giao bài tập mới');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo bài tập');
    }
  };

  // Teacher / Admin: Bật chế độ sửa bài tập
  const startEditAssignment = (assign) => {
    setEditingAssignId(assign._id);
    setEditAssignForm({
      title: assign.title || '',
      description: assign.description || '',
      dueDate: assign.dueDate ? assign.dueDate.split('T')[0] : '',
    });
  };

  // Teacher / Admin: Lưu cập nhật bài tập
  const handleUpdateAssignment = async (e, assignmentId) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/assignments/${assignmentId}`, editAssignForm);
      setEditingAssignId(null);
      toast.success('Đã cập nhật bài tập');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật bài tập');
    }
  };

  // Teacher / Admin: Xóa bài tập
  const handleDeleteAssignment = async (assignmentId, title) => {
    const ok = await confirm({
      title: 'Xóa bài tập',
      message: `Bạn có chắc muốn xóa bài tập "${title}"? Toàn bộ bài nộp của sinh viên trong bài tập này cũng sẽ bị xóa.`,
      confirmText: 'Xóa bài tập',
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/assignments/${assignmentId}`);
      toast.success('Đã xóa bài tập');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bài tập');
    }
  };

  // Student: Nộp bài tập
  const handleSubmitAssignment = async (assignmentId) => {
    const formData = new FormData();
    if (submitText[assignmentId]) formData.append('textAnswer', submitText[assignmentId]);
    if (submitFile[assignmentId]) formData.append('file', submitFile[assignmentId]);

    try {
      await axiosClient.post(`/assignments/${assignmentId}/submit`, formData);
      toast.success('Nộp bài thành công!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi nộp bài');
    }
  };

  // Teacher / Admin: Mở form chấm điểm inline
  const startGrade = (sub) => {
    setGradingSubId(sub._id);
    setGradeForm({
      grade: sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : '',
      feedback: sub.feedback || '',
    });
  };

  // Teacher / Admin: Lưu điểm
  const handleGrade = async (e, assignmentId, submissionId) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/assignments/${assignmentId}/grade/${submissionId}`, {
        grade: Number(gradeForm.grade),
        feedback: gradeForm.feedback,
      });
      setGradingSubId(null);
      toast.success('Đã lưu điểm và nhận xét!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu điểm');
    }
  };

  // Teacher / Admin: Xóa học viên khỏi khóa học
  const handleRemoveStudent = async (enrollmentId, studentName) => {
    const ok = await confirm({
      title: 'Xóa học viên khỏi lớp',
      message: `Bạn có chắc muốn xóa học viên "${studentName}" khỏi khóa học này?`,
      confirmText: 'Xóa học viên',
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/enrollments/${enrollmentId}`);
      toast.success('Đã xóa học viên khỏi lớp');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa học viên');
    }
  };

  if (!course) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="h-12 bg-slate-200 rounded-xl w-96" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const validStudents = students.filter((en) => en.student !== null);
  const completedSet = new Set(
    (myEnrollment?.completedMaterials || []).map((mid) => mid.toString())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách khóa học</span>
      </Link>

      {/* Course Hero Header */}
      <div className="bg-gradient-to-br from-indigo-800 via-indigo-700 to-violet-700 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block text-xs font-semibold bg-white/15 border border-white/20 backdrop-blur-xs px-3 py-1 rounded-full">
                {course.category}
              </span>
              {user?.role === 'admin' && (
                <button
                  onClick={startEditCourse}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 border border-white/25 text-white px-3 py-1 rounded-full cursor-pointer transition"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Chỉnh sửa khóa học</span>
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {course.title}
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {course.teacher?.avatar ? (
                <img
                  src={course.teacher.avatar}
                  alt={course.teacher.fullName}
                  className="w-8 h-8 rounded-full object-cover border border-white/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs">
                  {course.teacher?.fullName?.charAt(0).toUpperCase() || 'G'}
                </div>
              )}
              <span className="text-sm text-indigo-100">
                Giảng viên phụ trách:{' '}
                <strong className="text-white">{course.teacher?.fullName}</strong>
              </span>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="bg-white/10 border border-white/15 backdrop-blur-xs rounded-xl px-4 py-2.5 text-center">
              <p className="text-xl font-extrabold">{course.materials.length}</p>
              <p className="text-[11px] text-indigo-100">Tài liệu</p>
            </div>
            <div className="bg-white/10 border border-white/15 backdrop-blur-xs rounded-xl px-4 py-2.5 text-center">
              <p className="text-xl font-extrabold">{assignments.length}</p>
              <p className="text-[11px] text-indigo-100">Bài tập</p>
            </div>
            <div className="bg-white/10 border border-white/15 backdrop-blur-xs rounded-xl px-4 py-2.5 text-center">
              <p className="text-xl font-extrabold">{quizzes.length}</p>
              <p className="text-[11px] text-indigo-100">Trắc nghiệm</p>
            </div>
            {isTeacherOwner && (
              <div className="bg-white/10 border border-white/15 backdrop-blur-xs rounded-xl px-4 py-2.5 text-center">
                <p className="text-xl font-extrabold">{validStudents.length}</p>
                <p className="text-[11px] text-indigo-100">Sinh viên</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thanh tiến độ học tập cá nhân cho Sinh viên */}
      {user?.role === 'student' && myEnrollment && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tiến độ học tập của bạn
            </p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              Đã hoàn thành {completedSet.size}/{course.materials.length} tài liệu học tập
            </p>
          </div>
          <div className="flex items-center gap-3 sm:w-72">
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-300"
                style={{ width: `${myEnrollment.progress}%` }}
              />
            </div>
            <span className="text-sm font-extrabold text-indigo-700 w-11 text-right">
              {myEnrollment.progress}%
            </span>
          </div>
        </div>
      )}

      {/* Form chỉnh sửa khóa học cho Admin */}
      {user?.role === 'admin' && isEditingCourse && (
        <form
          onSubmit={handleUpdateCourse}
          className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm space-y-4"
        >
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-indigo-600" />
            <span>Chỉnh sửa thông tin khóa học (Admin)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tên khóa học
              </label>
              <input
                type="text"
                required
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Danh mục
              </label>
              <input
                type="text"
                required
                value={courseForm.category}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, category: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Mã tham gia lớp (nếu có)
              </label>
              <input
                type="text"
                value={courseForm.classCode}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, classCode: e.target.value })
                }
                placeholder="Để trống = công khai"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Mô tả / Giới thiệu môn học
            </label>
            <textarea
              required
              rows={4}
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({ ...courseForm, description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm leading-relaxed"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingCourse}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              {savingCourse ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditingCourse(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Tabs điều hướng dạng Segmented Pills */}
      <div className="inline-flex flex-wrap gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl">
        {[
          { key: 'materials', icon: Layers, label: `Tài liệu (${course.materials.length})` },
          { key: 'assignments', icon: ClipboardList, label: `Bài tập (${assignments.length})` },
          { key: 'quizzes', icon: HelpCircle, label: `Trắc nghiệm (${quizzes.length})` },
          {
            key: 'discussion',
            icon: MessageSquare,
            label: `Thảo luận (${announcements.length})`,
          },
          ...(isTeacherOwner
            ? [
                {
                  key: 'students',
                  icon: Users,
                  label: `Sinh viên (${validStudents.length})`,
                },
                { key: 'gradebook', icon: Table, label: 'Bảng điểm' },
              ]
            : []),
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition ${
                activeTab === tab.key
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TÀI LIỆU */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {isTeacherOwner && (
            <form
              onSubmit={handleAddMaterial}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Đăng tải tài liệu mới</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Tiêu đề tài liệu"
                  value={matForm.title}
                  onChange={(e) => setMatForm({ ...matForm, title: e.target.value })}
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
                />
                <select
                  value={matForm.type}
                  onChange={(e) => setMatForm({ ...matForm, type: e.target.value })}
                  className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
                >
                  <option value="pdf">Tệp PDF / Tài liệu</option>
                  <option value="video">Link Video bài giảng</option>
                  <option value="reading">Bài đọc trực tiếp</option>
                </select>
              </div>

              {matForm.type === 'pdf' && (
                <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-slate-300 rounded-xl bg-slate-50/70 hover:bg-slate-50 cursor-pointer text-sm text-slate-600">
                  <Upload className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">
                    {matFile ? matFile.name : 'Chọn tệp PDF, DOCX, ZIP hoặc ảnh...'}
                  </span>
                  <input
                    type="file"
                    required
                    onChange={(e) => setMatFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
              {matForm.type === 'video' && (
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={matForm.videoUrl}
                  onChange={(e) => setMatForm({ ...matForm, videoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
                />
              )}
              {matForm.type === 'reading' && (
                <textarea
                  required
                  rows={3}
                  placeholder="Nội dung bài đọc..."
                  value={matForm.content}
                  onChange={(e) => setMatForm({ ...matForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
                />
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm tài liệu</span>
              </button>
            </form>
          )}

          {course.materials.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
              Chưa có tài liệu học tập nào trong khóa học này.
            </div>
          ) : (
            <div className="space-y-3">
              {course.materials.map((m) => {
                const isDone = completedSet.has(m._id?.toString());
                const embedUrl = m.type === 'video' ? getYoutubeEmbedUrl(m.videoUrl) : null;
                const fileUrl = m.fileUrl ? getFileUrl(m.fileUrl) : '';
                const isPdfFile = fileUrl.toLowerCase().includes('.pdf');

                return (
                  <div
                    key={m._id}
                    className={`bg-white p-5 rounded-2xl border shadow-xs transition space-y-4 ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200/90 hover:border-indigo-200'
                    }`}
                  >
                    {editingMatId === m._id ? (
                      <form
                        onSubmit={(e) => handleUpdateMaterial(e, m._id)}
                        className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={editMatForm.title}
                            onChange={(e) =>
                              setEditMatForm({ ...editMatForm, title: e.target.value })
                            }
                            className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                          />
                          <select
                            value={editMatForm.type}
                            onChange={(e) =>
                              setEditMatForm({ ...editMatForm, type: e.target.value })
                            }
                            className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                          >
                            <option value="pdf">Tệp PDF / Tài liệu</option>
                            <option value="video">Link Video bài giảng</option>
                            <option value="reading">Bài đọc trực tiếp</option>
                          </select>
                        </div>

                        {editMatForm.type === 'pdf' && (
                          <div>
                            <p className="text-xs text-slate-500 mb-1.5">
                              Chọn tệp mới nếu muốn thay thế tệp hiện tại:
                            </p>
                            <input
                              type="file"
                              onChange={(e) => setEditMatFile(e.target.files[0])}
                              className="block text-sm text-slate-600"
                            />
                          </div>
                        )}
                        {editMatForm.type === 'video' && (
                          <input
                            type="url"
                            required
                            value={editMatForm.videoUrl}
                            onChange={(e) =>
                              setEditMatForm({ ...editMatForm, videoUrl: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                          />
                        )}
                        {editMatForm.type === 'reading' && (
                          <textarea
                            required
                            rows={3}
                            value={editMatForm.content}
                            onChange={(e) =>
                              setEditMatForm({ ...editMatForm, content: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                          />
                        )}

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Lưu thay đổi
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMatId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex items-start gap-3.5">
                            {m.type === 'pdf' && (
                              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            {m.type === 'video' && (
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Video className="w-5 h-5" />
                              </div>
                            )}
                            {m.type === 'reading' && (
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <BookOpen className="w-5 h-5" />
                              </div>
                            )}

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-slate-900">{m.title}</h4>
                                {isDone && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Đã hoàn thành
                                  </span>
                                )}
                              </div>

                              {m.type === 'pdf' && m.fileUrl && (
                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Tải xuống / Mở tab mới</span>
                                  </a>
                                  {isPdfFile && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPreviewPdf({ title: m.title, url: fileUrl })
                                      }
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-700 cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Xem trước PDF</span>
                                    </button>
                                  )}
                                </div>
                              )}

                              {m.type === 'video' && (
                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                  {embedUrl && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenVideoId(openVideoId === m._id ? null : m._id)
                                      }
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                                    >
                                      <PlayCircle className="w-4 h-4" />
                                      <span>
                                        {openVideoId === m._id
                                          ? 'Thu gọn trình phát'
                                          : 'Xem video ngay'}
                                      </span>
                                    </button>
                                  )}
                                  <a
                                    href={m.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:underline"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Mở liên kết gốc</span>
                                  </a>
                                </div>
                              )}

                              {m.type === 'reading' && (
                                <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  {m.content}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {user?.role === 'student' && (
                              <button
                                onClick={() => handleCompleteMaterial(m._id)}
                                disabled={isDone}
                                className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-semibold transition ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 cursor-pointer'
                                }`}
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>{isDone ? 'Đã học' : 'Đánh dấu đã học'}</span>
                              </button>
                            )}

                            {isTeacherOwner && (
                              <>
                                <button
                                  onClick={() => startEditMaterial(m)}
                                  className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/70 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Sửa</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteMaterial(m._id, m.title)}
                                  className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {embedUrl && openVideoId === m._id && (
                          <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-black">
                            <iframe
                              src={embedUrl}
                              title={m.title}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BÀI TẬP */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {isTeacherOwner && (
            <form
              onSubmit={handleCreateAssignment}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Giao bài tập mới</h3>
              </div>

              <input
                type="text"
                required
                placeholder="Tiêu đề bài tập"
                value={assignForm.title}
                onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
              />
              <textarea
                required
                rows={3}
                placeholder="Yêu cầu chi tiết bài tập..."
                value={assignForm.description}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, description: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
              />
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Hạn nộp bài
                  </label>
                  <input
                    type="date"
                    required
                    value={assignForm.dueDate}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, dueDate: e.target.value })
                    }
                    className="px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo bài tập</span>
                </button>
              </div>
            </form>
          )}

          {assignments.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
              Chưa có bài tập nào được giao trong khóa học này.
            </div>
          ) : (
            assignments.map((assign) => {
              const mySub = assign.submissions?.find(
                (s) => s.student?._id === user?._id
              );
              const validSubmissions =
                assign.submissions?.filter((sub) => sub.student !== null) || [];
              const isPastDue = new Date(assign.dueDate) < new Date();

              return (
                <div
                  key={assign._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5"
                >
                  {editingAssignId === assign._id ? (
                    <form
                      onSubmit={(e) => handleUpdateAssignment(e, assign._id)}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3"
                    >
                      <h4 className="font-bold text-slate-800 text-sm">
                        Chỉnh sửa bài tập
                      </h4>
                      <input
                        type="text"
                        required
                        value={editAssignForm.title}
                        onChange={(e) =>
                          setEditAssignForm({ ...editAssignForm, title: e.target.value })
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                      />
                      <textarea
                        required
                        rows={3}
                        value={editAssignForm.description}
                        onChange={(e) =>
                          setEditAssignForm({
                            ...editAssignForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                      />
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">
                          Hạn nộp bài
                        </label>
                        <input
                          type="date"
                          required
                          value={editAssignForm.dueDate}
                          onChange={(e) =>
                            setEditAssignForm({
                              ...editAssignForm,
                              dueDate: e.target.value,
                            })
                          }
                          className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Lưu thay đổi
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAssignId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{assign.title}</h3>
                        <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-line leading-relaxed">
                          {assign.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${
                            isPastDue
                              ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Hạn nộp: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}
                          </span>
                        </span>

                        {isTeacherOwner && (
                          <>
                            <button
                              onClick={() => startEditAssignment(assign)}
                              className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/70 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteAssignment(assign._id, assign.title)
                              }
                              className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Khu vực của Sinh viên */}
                  {user?.role === 'student' && (
                    <div className="bg-slate-50/80 border border-slate-200/70 p-4 rounded-xl space-y-3">
                      {mySub && (
                        <div className="text-sm bg-emerald-50 border border-emerald-200/70 text-emerald-900 p-3.5 rounded-xl space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              Đã nộp bài
                              {mySub.isLate && (
                                <span className="text-[11px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                                  Nộp muộn
                                </span>
                              )}
                            </span>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              Điểm:{' '}
                              {mySub.grade !== null ? `${mySub.grade}/10` : 'Chưa chấm'}
                            </span>
                          </div>
                          {mySub.feedback && (
                            <p className="text-xs text-emerald-800 pt-1">
                              <strong>Nhận xét GV:</strong> {mySub.feedback}
                            </p>
                          )}
                        </div>
                      )}

                      <textarea
                        rows={2}
                        placeholder="Nhập câu trả lời dạng văn bản (tùy chọn)..."
                        value={submitText[assign._id] || ''}
                        onChange={(e) =>
                          setSubmitText({ ...submitText, [assign._id]: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50">
                          <Upload className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="max-w-[200px] truncate">
                            {submitFile[assign._id]?.name || 'Đính kèm tệp bài làm'}
                          </span>
                          <input
                            type="file"
                            onChange={(e) =>
                              setSubmitFile({
                                ...submitFile,
                                [assign._id]: e.target.files[0],
                              })
                            }
                            className="hidden"
                          />
                        </label>

                        <button
                          onClick={() => handleSubmitAssignment(assign._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs"
                        >
                          {mySub ? 'Nộp lại bài' : 'Nộp bài tập'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Khu vực chấm điểm của Giảng viên */}
                  {isTeacherOwner && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-bold text-slate-800 mb-3">
                        Danh sách bài nộp ({validSubmissions.length})
                      </h4>

                      {validSubmissions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          Chưa có sinh viên nào nộp bài tập này.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {validSubmissions.map((sub) => (
                            <div
                              key={sub._id}
                              className="bg-slate-50/90 border border-slate-200/70 p-4 rounded-xl text-sm space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-800">
                                      {sub.student?.fullName}
                                    </p>
                                    {sub.isLate && (
                                      <span className="text-[11px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                                        Nộp muộn
                                      </span>
                                    )}
                                  </div>
                                  {sub.textAnswer && (
                                    <p className="text-slate-600 text-xs sm:text-sm">
                                      <strong>Nội dung:</strong> {sub.textAnswer}
                                    </p>
                                  )}
                                  {sub.fileUrl && (
                                    <a
                                      href={getFileUrl(sub.fileUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      <span>Xem / Tải file đính kèm</span>
                                    </a>
                                  )}
                                  {sub.feedback && gradingSubId !== sub._id && (
                                    <p className="text-xs text-slate-500">
                                      <strong>Nhận xét:</strong> {sub.feedback}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <span
                                    className={`font-bold text-xs px-3 py-1 rounded-full ${
                                      sub.grade !== null
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {sub.grade !== null
                                      ? `Điểm: ${sub.grade}/10`
                                      : 'Chưa chấm'}
                                  </span>
                                  <button
                                    onClick={() => startGrade(sub)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                                  >
                                    Chấm điểm
                                  </button>
                                </div>
                              </div>

                              {gradingSubId === sub._id && (
                                <form
                                  onSubmit={(e) => handleGrade(e, assign._id, sub._id)}
                                  className="bg-white p-3.5 rounded-xl border border-indigo-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    required
                                    placeholder="Điểm (0-10)"
                                    value={gradeForm.grade}
                                    onChange={(e) =>
                                      setGradeForm({ ...gradeForm, grade: e.target.value })
                                    }
                                    className="w-full sm:w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Nhận xét cho sinh viên..."
                                    value={gradeForm.feedback}
                                    onChange={(e) =>
                                      setGradeForm({
                                        ...gradeForm,
                                        feedback: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                                    >
                                      Lưu điểm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setGradingSubId(null)}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: TRẮC NGHIỆM (QUIZ) */}
      {activeTab === 'quizzes' && (
        <CourseQuizzesTab
          courseId={id}
          quizzes={quizzes}
          isTeacherOwner={isTeacherOwner}
          user={user}
          onReload={loadData}
        />
      )}

      {/* TAB 4: THẢO LUẬN & THÔNG BÁO */}
      {activeTab === 'discussion' && (
        <CourseDiscussionTab
          courseId={id}
          announcements={announcements}
          isTeacherOwner={isTeacherOwner}
          onReload={loadData}
        />
      )}

      {/* TAB 5: DANH SÁCH SINH VIÊN */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Họ và tên</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Tiến độ học tập</th>
                  <th className="p-4 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Chưa có sinh viên nào ghi danh vào khóa học này.
                    </td>
                  </tr>
                ) : (
                  validStudents.map((en) => (
                    <tr key={en._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {en.student?.fullName?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {en.student?.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{en.student?.email}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 max-w-[200px]">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${en.progress}%` }}
                            />
                          </div>
                          <span className="font-bold text-xs text-indigo-600 w-10 text-right">
                            {en.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() =>
                            handleRemoveStudent(en._id, en.student?.fullName)
                          }
                          className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70 px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa khỏi lớp</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: BẢNG ĐIỂM */}
      {activeTab === 'gradebook' && (
        <CourseGradebookTab
          courseTitle={course.title}
          students={validStudents}
          assignments={assignments}
          quizzes={quizzes}
        />
      )}

      {/* Modal xem trước PDF */}
      {previewPdf && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 truncate pr-4">
                Xem trước: {previewPdf.title}
              </h3>
              <button
                onClick={() => setPreviewPdf(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={previewPdf.url}
              title={previewPdf.title}
              className="w-full flex-1 bg-slate-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
