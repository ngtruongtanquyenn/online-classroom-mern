import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0 });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

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

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Admin xác nhận xóa khóa học này?')) return;
    await axiosClient.delete(`/courses/${courseId}`);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển Quản trị viên (Admin)</h1>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">Tổng người dùng</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">Tổng khóa học</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">Tổng lượt ghi danh</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.totalEnrollments}</p>
        </div>
      </div>

      {/* Quản lý người dùng */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b font-bold text-slate-800">Quản lý Người dùng</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">Họ tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="p-4 font-medium">{u.fullName}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 uppercase text-xs font-bold">{u.role}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className={`px-3 py-1 rounded text-xs text-white cursor-pointer ${
                          u.isActive ? 'bg-rose-500' : 'bg-emerald-600'
                        }`}
                      >
                        {u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quản lý khóa học toàn hệ thống */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b font-bold text-slate-800">Quản lý Danh mục & Khóa học</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">Tên khóa học</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Giảng viên</th>
                <th className="p-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="p-4 font-medium">{c.title}</td>
                  <td className="p-4">{c.category}</td>
                  <td className="p-4">{c.teacher?.fullName}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDeleteCourse(c._id)}
                      className="bg-rose-500 text-white px-3 py-1 rounded text-xs cursor-pointer"
                    >
                      Xóa khóa học
                    </button>
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