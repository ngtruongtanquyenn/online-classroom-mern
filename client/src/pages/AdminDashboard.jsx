import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  Users,
  BookOpen,
  GraduationCap,
  Lock,
  Unlock,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const ROLE_STYLES = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  teacher: 'bg-amber-100 text-amber-800 border-amber-200',
  student: 'bg-sky-100 text-sky-700 border-sky-200',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0 });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

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
    await axiosClient.put(`/admin/users/${userId}/toggle-status`);
    fetchData();
  };

  const handleDeleteUser = async (userId, fullName) => {
    if (!window.confirm(`Admin xác nhận xóa tài khoản "${fullName}"?`)) return;
    try {
      await axiosClient.delete(`/admin/users/${userId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi khi xóa tài khoản');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Admin xác nhận xóa khóa học này?')) return;
    await axiosClient.delete(`/courses/${courseId}`);
    fetchData();
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
            Giám sát người dùng, phân quyền trạng thái tài khoản và kiểm duyệt khóa học.
          </p>
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Tổng người dùng</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Tổng khóa học</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalCourses}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium">Tổng lượt ghi danh</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalEnrollments}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
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
              onChange={(e) => setUserSearch(e.target.value)}
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
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
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
      </div>

      {/* Quản lý khóa học toàn hệ thống */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              Quản lý Danh mục & Khóa học ({filteredCourses.length})
            </h2>
            <p className="text-xs text-slate-500">Theo dõi và kiểm duyệt toàn bộ lớp học trên hệ thống</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
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
              {filteredCourses.map((c) => (
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
                        onClick={() => handleDeleteCourse(c._id)}
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
      </div>
    </div>
  );
}
