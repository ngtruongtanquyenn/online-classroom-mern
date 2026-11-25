import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('materials');

  // State form thêm tài liệu (Teacher)
  const [matForm, setMatForm] = useState({
    title: '',
    type: 'pdf',
    videoUrl: '',
    content: '',
  });
  const [matFile, setMatFile] = useState(null);

  // State chỉnh sửa tài liệu (Teacher)
  const [editingMatId, setEditingMatId] = useState(null);
  const [editMatForm, setEditMatForm] = useState({
    title: '',
    type: 'pdf',
    videoUrl: '',
    content: '',
  });
  const [editMatFile, setEditMatFile] = useState(null);

  // State form tạo bài tập (Teacher)
  const [assignForm, setAssignForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  // State chỉnh sửa bài tập (Teacher)
  const [editingAssignId, setEditingAssignId] = useState(null);
  const [editAssignForm, setEditAssignForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  // State nộp bài (Student)
  const [submitText, setSubmitText] = useState({});
  const [submitFile, setSubmitFile] = useState({});

  // State chấm điểm inline (Teacher)
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
    const [courseRes, assignRes] = await Promise.all([
      axiosClient.get(`/courses/${id}`),
      axiosClient.get(`/assignments/course/${id}`),
    ]);
    setCourse(courseRes.data);
    setAssignments(assignRes.data);

    if (user?.role === 'teacher' || user?.role === 'admin') {
      const stuRes = await axiosClient.get(`/enrollments/course/${id}/students`);
      setStudents(stuRes.data);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Teacher: Thêm tài liệu
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', matForm.title);
    formData.append('type', matForm.type);
    if (matForm.type === 'video') formData.append('videoUrl', matForm.videoUrl);
    if (matForm.type === 'reading') formData.append('content', matForm.content);
    if (matForm.type === 'pdf' && matFile) formData.append('file', matFile);

    await axiosClient.post(`/courses/${id}/materials`, formData);
    setMatForm({ title: '', type: 'pdf', videoUrl: '', content: '' });
    setMatFile(null);
    loadData();
  };

  // Teacher: Bật chế độ sửa tài liệu
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

  // Teacher: Lưu cập nhật tài liệu
  const handleUpdateMaterial = async (e, materialId) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editMatForm.title);
    formData.append('type', editMatForm.type);
    if (editMatForm.type === 'video') formData.append('videoUrl', editMatForm.videoUrl);
    if (editMatForm.type === 'reading') formData.append('content', editMatForm.content);
    if (editMatForm.type === 'pdf' && editMatFile) formData.append('file', editMatFile);

    await axiosClient.put(`/courses/${id}/materials/${materialId}`, formData);
    setEditingMatId(null);
    setEditMatFile(null);
    loadData();
  };

  // Teacher: Xóa tài liệu
  const handleDeleteMaterial = async (materialId, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài liệu "${title}"?`)) return;
    await axiosClient.delete(`/courses/${id}/materials/${materialId}`);
    loadData();
  };

  // Student: Đánh dấu hoàn thành tài liệu
  const handleCompleteMaterial = async (materialId) => {
    const { data } = await axiosClient.put(
      `/enrollments/${id}/complete-material/${materialId}`
    );
    alert(`Đã cập nhật tiến độ học tập: ${data.progress}%`);
  };

  // Teacher: Tạo bài tập
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    await axiosClient.post('/assignments', { ...assignForm, courseId: id });
    setAssignForm({ title: '', description: '', dueDate: '' });
    loadData();
  };

  // Teacher: Bật chế độ sửa bài tập
  const startEditAssignment = (assign) => {
    setEditingAssignId(assign._id);
    setEditAssignForm({
      title: assign.title || '',
      description: assign.description || '',
      dueDate: assign.dueDate ? assign.dueDate.split('T')[0] : '',
    });
  };

  // Teacher: Lưu cập nhật bài tập
  const handleUpdateAssignment = async (e, assignmentId) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/assignments/${assignmentId}`, editAssignForm);
      setEditingAssignId(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi cập nhật bài tập');
    }
  };

  // Teacher: Xóa bài tập
  const handleDeleteAssignment = async (assignmentId, title) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa bài tập "${title}"? Toàn bộ bài nộp của sinh viên trong bài tập này cũng sẽ bị xóa.`
      )
    ) {
      return;
    }
    try {
      await axiosClient.delete(`/assignments/${assignmentId}`);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa bài tập');
    }
  };

  // Student: Nộp bài tập
  const handleSubmitAssignment = async (assignmentId) => {
    const formData = new FormData();
    if (submitText[assignmentId]) formData.append('textAnswer', submitText[assignmentId]);
    if (submitFile[assignmentId]) formData.append('file', submitFile[assignmentId]);

    try {
      await axiosClient.post(`/assignments/${assignmentId}/submit`, formData);
      alert('Nộp bài thành công!');
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi nộp bài');
    }
  };

  // Teacher: Mở form chấm điểm inline
  const startGrade = (sub) => {
    setGradingSubId(sub._id);
    setGradeForm({
      grade: sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : '',
      feedback: sub.feedback || '',
    });
  };

  // Teacher: Lưu điểm
  const handleGrade = async (e, assignmentId, submissionId) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/assignments/${assignmentId}/grade/${submissionId}`, {
        grade: Number(gradeForm.grade),
        feedback: gradeForm.feedback,
      });
      setGradingSubId(null);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi lưu điểm');
    }
  };

  // Teacher / Admin: Xóa học viên khỏi khóa học
  const handleRemoveStudent = async (enrollmentId, studentName) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa học viên "${studentName}" khỏi khóa học này?`
      )
    ) {
      return;
    }
    try {
      await axiosClient.delete(`/enrollments/${enrollmentId}`);
      alert('Đã xóa học viên khỏi lớp');
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa học viên');
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

  // Lọc bỏ các bản ghi mồ côi nếu user đã bị xóa
  const validStudents = students.filter((en) => en.student !== null);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Nút quay lại */}
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
            <span className="inline-block text-xs font-semibold bg-white/15 border border-white/20 backdrop-blur-xs px-3 py-1 rounded-full">
              {course.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {course.title}
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              {course.description}
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xs">
                {course.teacher?.fullName?.charAt(0).toUpperCase() || 'G'}
              </div>
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
            {isTeacherOwner && (
              <div className="bg-white/10 border border-white/15 backdrop-blur-xs rounded-xl px-4 py-2.5 text-center">
                <p className="text-xl font-extrabold">{validStudents.length}</p>
                <p className="text-[11px] text-indigo-100">Sinh viên</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs điều hướng dạng Segmented Pills */}
      <div className="inline-flex flex-wrap gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition ${
            activeTab === 'materials'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tài liệu học tập ({course.materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition ${
            activeTab === 'assignments'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Bài tập ({assignments.length})</span>
        </button>

        {isTeacherOwner && (
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition ${
              activeTab === 'students'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Sinh viên ghi danh ({validStudents.length})</span>
          </button>
        )}
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
              {course.materials.map((m) => (
                <div
                  key={m._id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-200 transition"
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
                          <h4 className="font-bold text-slate-900">{m.title}</h4>
                          {m.type === 'pdf' && m.fileUrl && (
                            <a
                              href={getFileUrl(m.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline mt-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Tải xuống / Xem tài liệu</span>
                            </a>
                          )}
                          {m.type === 'video' && (
                            <a
                              href={m.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline mt-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Mở liên kết Video bài giảng</span>
                            </a>
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
                            className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 px-3.5 py-2 rounded-xl font-semibold cursor-pointer transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Đánh dấu đã học</span>
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
                  )}
                </div>
              ))}
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
                                  <p className="font-bold text-slate-800">
                                    {sub.student?.fullName}
                                  </p>
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

      {/* TAB 3: DANH SÁCH SINH VIÊN */}
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
    </div>
  );
}
