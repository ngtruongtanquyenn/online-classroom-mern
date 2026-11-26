import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Lock,
  Unlock,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  Pencil,
  X,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ROLE_STYLES = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  teacher: 'bg-amber-100 text-amber-800 border-amber-200',
  student: 'bg-sky-100 text-sky-700 border-sky-200',
};

const PAGE_SIZE = 8;

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalAssignments: 0,
    roleCounts: { students: 0, teachers: 0, admins: 0 },
    categoryCounts: [],
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [coursePage, setCoursePage] = useState(1);

  const [editingCourse, setEditingCourse] = useState(null);
  const [courseEditForm, setCourseEditForm] = useState({
    title: '',
    category: '',
    description: '',
    classCode: '',
  });
  const [savingCourse, setSavingCourse] = useState(false);

  const { toast, confirm } = useToast();

  const fetchData = async () => {
    const [statsRes, usersRes, coursesRes] = await Promise.all([
      axiosClient.get('/admin/stats'),
      axiosClient.get('/admin/users'),
      axiosClient.get('/admin/courses'),
    ]);
    setStats(statsRes.data);
    setUsers(usersRes.data);
    setCourses(coursesRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      const { data } = await axiosClient.put(`/admin/users/${userId}/toggle-status`);
      toast.info(data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDeleteUser = async (userId, fullName) => {
    const ok = await confirm({
      title: 'Xóa tài khoản người dùng',
      message: `Xác nhận xóa tài khoản "${fullName}" cùng toàn bộ dữ liệu liên quan (khóa học, ghi danh, bài nộp)?`,
      confirmText: 'Xóa tài khoản',
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/admin/users/${userId}`);
      toast.success(`Đã xóa tài khoản "${fullName}"`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa tài khoản');
    }
  };

  const handleDeleteCourse = async (course) => {
    const ok = await confirm({
      title: 'Xóa khóa học',
      message: `Admin xác nhận xóa khóa học "${course.title}"?`,
      confirmText: 'Xóa khóa học',
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/courses/${course._id}`);
      toast.success('Đã xóa khóa học');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa khóa học');
    }
  };

  const startEditCourse = (course) => {
    setEditingCourse(course);
    setCourseEditForm({
      title: course.title || '',
      category: course.category || '',
      description: course.description || '',
      classCode: course.classCode || '',
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSavingCourse(true);
    try {
      await axiosClient.put(`/courses/${editingCourse._id}`, courseEditForm);
      setEditingCourse(null);
      toast.success('Đã cập nhật thông tin khóa học');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật khóa học');
    } finally {
      setSavingCourse(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredCourses = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.category?.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.teacher?.fullName?.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice(
    (userPage - 1) * PAGE_SIZE,
    userPage * PAGE_SIZE
  );

  const courseTotalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const pagedCourses = filteredCourses.slice(
    (coursePage - 1) * PAGE_SIZE,
    coursePage * PAGE_SIZE
  );

  const roleTotal = Math.max(1, stats.totalUsers);
  const maxCategoryCount = Math.max(
    1,
    ...(stats.categoryCounts || []).map((c) => c.count)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Quản trị hệ thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Bảng điều khiển Admin
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Giám sát người dùng, thống kê trực quan và kiểm duyệt toàn bộ khóa học.
          </p>
        </div>
      </div>

      {/* Thống kê KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium">Tổng người dùng</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium">Tổng khóa học</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalCourses}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium">Tổng lượt ghi danh</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.totalEnrollments}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-medium">Tổng bài tập</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              {stats.totalAssignments || 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Biểu đồ phân tích trực quan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Phân bố vai trò người dùng</span>
          </div>
          <div className="space-y-3">
            {[
              {
                label: 'Sinh viên (Student)',
                count: stats.roleCounts?.students || 0,
                color: 'bg-sky-500',
              },
              {
                label: 'Giảng viên (Teacher)',
                count: stats.roleCounts?.teachers || 0,
                color: 'bg-amber-500',
              },
              {
                label: 'Quản trị viên (Admin)',
                count: stats.roleCounts?.admins || 0,
                color: 'bg-purple-500',
              },
            ].map((row) => {
              const pct = Math.round((row.count / roleTotal) * 100);
              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{row.label}</span>
                    <span>
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${row.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Khóa học theo danh mục</span>
          </div>
          {!stats.categoryCounts || stats.categoryCounts.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có dữ liệu khóa học.</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryCounts.map((cat) => {
                const pct = Math.round((cat.count / maxCategoryCount) * 100);
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span className="truncate pr-2">{cat.category}</span>
                      <span>{cat.count} khóa học</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quản lý người dùng */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Quản lý Người dùng ({filteredUsers.length})
            </h2>
            <p className="text-xs text-slate-500">Khóa, mở khóa hoặc xóa tài khoản thành viên</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserPage(1);
              }}
              placeholder="Tìm tên hoặc email..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Người dùng</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Vai trò</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className="font-semibold text-slate-800">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${
                        ROLE_STYLES[u.role] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleToggleUser(u._id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                            u.isActive
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/70'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70'
                          }`}
                        >
                          {u.isActive ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Khóa</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Mở khóa</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.fullName)}
                          className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {userTotalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang {userPage} / {userTotalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                disabled={userPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                disabled={userPage === userTotalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quản lý khóa học toàn hệ thống */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Quản lý Danh mục & Khóa học ({filteredCourses.length})
            </h2>
            <p className="text-xs text-slate-500">Theo dõi, chỉnh sửa và kiểm duyệt toàn bộ lớp học</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={courseSearch}
              onChange={(e) => {
                setCourseSearch(e.target.value);
                setCoursePage(1);
              }}
              placeholder="Tìm khóa học, giảng viên..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Tên khóa học</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Giảng viên</th>
                <th className="p-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedCourses.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-semibold text-slate-800">{c.title}</td>
                  <td className="p-4">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                      {c.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{c.teacher?.fullName || '—'}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/courses/${c._id}`}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Xem lớp</span>
                      </Link>
                      <button
                        onClick={() => startEditCourse(c)}
                        className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/70 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c)}
                        className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {courseTotalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang {coursePage} / {courseTotalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
                disabled={coursePage === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCoursePage((p) => Math.min(courseTotalPages, p + 1))}
                disabled={coursePage === courseTotalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal chỉnh sửa khóa học (Admin) */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Chỉnh sửa khóa học
              </h3>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Tên khóa học
                </label>
                <input
                  type="text"
                  required
                  value={courseEditForm.title}
                  onChange={(e) =>
                    setCourseEditForm({ ...courseEditForm, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Danh mục
                  </label>
                  <input
                    type="text"
                    required
                    value={courseEditForm.category}
                    onChange={(e) =>
                      setCourseEditForm({ ...courseEditForm, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Mã tham gia lớp
                  </label>
                  <input
                    type="text"
                    value={courseEditForm.classCode}
                    onChange={(e) =>
                      setCourseEditForm({ ...courseEditForm, classCode: e.target.value })
                    }
                    placeholder="Để trống = công khai"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Mô tả / Giới thiệu khóa học
                </label>
                <textarea
                  required
                  rows={4}
                  value={courseEditForm.description}
                  onChange={(e) =>
                    setCourseEditForm({
                      ...courseEditForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold cursor-pointer transition"
                >
                  {savingCourse ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
