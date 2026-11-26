import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Trash2,
  FolderOpen,
  Layers,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  X,
} from 'lucide-react';

const PRESET_CATEGORIES = [
  'Lập trình Web',
  'Cơ sở dữ liệu',
  'Trí tuệ nhân tạo',
  'Kỹ thuật phần mềm',
  'Công nghệ thông tin',
];

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    description: '',
    classCode: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const { user } = useAuth();
  const { toast, confirm } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Lập trình Web',
    classCode: '',
    isPublished: true,
  });

  const fetchMyCourses = async () => {
    try {
      const { data } = await axiosClient.get('/courses/my-courses');
      setCourses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axiosClient.post('/courses', form);
      setForm({
        title: '',
        description: '',
        category: 'Lập trình Web',
        classCode: '',
        isPublished: true,
      });
      toast.success('Đã tạo khóa học mới!');
      fetchMyCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo khóa học');
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      await axiosClient.put(`/courses/${course._id}`, {
        isPublished: !course.isPublished,
      });
      toast.info(
        !course.isPublished ? 'Đã mở công khai khóa học' : 'Đã chuyển khóa học về Nháp'
      );
      fetchMyCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đổi trạng thái');
    }
  };

  const startEdit = (course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title || '',
      category: course.category || '',
      description: course.description || '',
      classCode: course.classCode || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSavingEdit(true);
    try {
      await axiosClient.put(`/courses/${editingCourse._id}`, editForm);
      setEditingCourse(null);
      toast.success('Cập nhật thông tin khóa học thành công!');
      fetchMyCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật khóa học');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (course) => {
    const ok = await confirm({
      title: 'Xóa khóa học',
      message: `Bạn chắc chắn muốn xóa "${course.title}"? Toàn bộ bài tập, trắc nghiệm và lượt ghi danh của lớp sẽ bị xóa.`,
      confirmText: 'Xóa lớp học',
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/courses/${course._id}`);
      toast.success('Đã xóa khóa học');
      fetchMyCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa khóa học');
    }
  };

  const totalMaterials = courses.reduce(
    (sum, c) => sum + (c.materials?.length || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-700 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-cyan-200 text-xs font-semibold uppercase tracking-wider">
            Không gian Giảng viên
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Xin chào, {user?.fullName}
          </h1>
          <p className="text-blue-100 text-sm mt-1.5">
            Khởi tạo lớp học, quản lý mã tham gia, đăng tải học liệu và chấm điểm sinh viên.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white/15 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 text-center min-w-[110px]">
            <p className="text-2xl font-extrabold">{courses.length}</p>
            <p className="text-xs text-blue-100">Lớp giảng dạy</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 text-center min-w-[110px]">
            <p className="text-2xl font-extrabold">{totalMaterials}</p>
            <p className="text-xs text-blue-100">Tổng học liệu</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form tạo khóa học */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 lg:sticky lg:top-24">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tạo khóa học mới</h2>
              <p className="text-xs text-slate-500">Mở lớp học trực tuyến mới</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tên khóa học
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                placeholder="VD: Lập trình MERN Stack từ A-Z"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Danh mục
              </label>
              <input
                type="text"
                list="preset-categories"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
              />
              <datalist id="preset-categories">
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mã tham gia lớp (tùy chọn)
              </label>
              <input
                type="text"
                value={form.classCode}
                onChange={(e) => setForm({ ...form, classCode: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                placeholder="Để trống nếu mở công khai"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Mô tả khóa học
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                placeholder="Nội dung tổng quan, mục tiêu của môn học..."
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>Công khai khóa học ngay sau khi tạo</span>
            </label>

            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{creating ? 'Đang tạo...' : 'Tạo lớp học'}</span>
            </button>
          </form>
        </div>

        {/* Danh sách khóa học của giảng viên */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Lớp học tôi giảng dạy ({courses.length})
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3"
                >
                  <div className="h-4 bg-slate-200 rounded w-24" />
                  <div className="h-5 bg-slate-200 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Chưa có lớp học nào</h3>
              <p className="text-sm text-slate-500 mt-1">
                Sử dụng biểu mẫu bên cạnh để tạo khóa học đầu tiên của bạn.
              </p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course._id}
                className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full font-semibold">
                      {course.category}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        course.isPublished
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {course.isPublished ? 'Công khai' : 'Bản nháp'}
                    </span>
                    {course.classCode && (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold">
                        <Lock className="w-3 h-3" />
                        Mã: {course.classCode}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {course.materials?.length || 0} tài liệu
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {course.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Link
                    to={`/courses/${course._id}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Quản lý lớp</span>
                  </Link>
                  <button
                    onClick={() => handleTogglePublish(course)}
                    title={course.isPublished ? 'Ẩn khóa học (Nháp)' : 'Công khai khóa học'}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition"
                  >
                    {course.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(course)}
                    title="Chỉnh sửa thông tin lớp"
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/70 cursor-pointer transition"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course)}
                    title="Xóa khóa học"
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 cursor-pointer transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal sửa thông tin khóa học */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Chỉnh sửa thông tin khóa học
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên khóa học
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Danh mục
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mã tham gia lớp
                  </label>
                  <input
                    type="text"
                    value={editForm.classCode}
                    onChange={(e) =>
                      setEditForm({ ...editForm, classCode: e.target.value })
                    }
                    placeholder="Để trống = công khai"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Giới thiệu / Mô tả môn học
                </label>
                <textarea
                  required
                  rows={4}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold cursor-pointer"
                >
                  {savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
