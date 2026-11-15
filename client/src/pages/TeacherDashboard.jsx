import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Lập trình Web',
  });

  const fetchMyCourses = async () => {
    const { data } = await axiosClient.get('/courses/my-courses');
    setCourses(data);
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await axiosClient.post('/courses', form);
    setForm({ title: '', description: '', category: 'Lập trình Web' });
    fetchMyCourses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa khóa học này?')) return;
    await axiosClient.delete(`/courses/${id}`);
    fetchMyCourses();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form tạo khóa học */}
      <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-600" />
          <span>Tạo Khóa học mới</span>
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tên khóa học</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="VD: Lập trình MERN Stack từ A-Z"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Danh mục</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả khóa học</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Nội dung tổng quan của môn học..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg cursor-pointer"
          >
            Tạo lớp học
          </button>
        </form>
      </div>

      {/* Danh sách khóa học của giảng viên */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          Lớp học tôi giảng dạy ({courses.length})
        </h2>
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white p-5 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-medium">
                {course.category}
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-1">{course.title}</h3>
              <p className="text-sm text-slate-500">
                Số tài liệu: {course.materials?.length || 0}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/courses/${course._id}`}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Quản lý lớp</span>
              </Link>
              <button
                onClick={() => handleDelete(course._id)}
                className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-lg text-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}