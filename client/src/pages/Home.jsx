import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Search, User, BookOpen, GraduationCap, Sparkles, Layers } from 'lucide-react';

const CATEGORIES = ['Tất cả', 'Lập trình Web', 'Cơ sở dữ liệu', 'Trí tuệ nhân tạo', 'Kỹ thuật phần mềm'];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [enrolledIds, setEnrolledIds] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCourses = async (searchKey = keyword, cat = selectedCategory) => {
    const categoryParam = cat === 'Tất cả' ? 'All' : cat;
    const { data } = await axiosClient.get(
      `/courses?keyword=${searchKey}&category=${categoryParam}`
    );
    setCourses(data);
  };

  useEffect(() => {
    fetchCourses();
    if (user?.role === 'student') {
      axiosClient.get('/enrollments/my-enrollments').then(({ data }) => {
        setEnrolledIds(data.map((e) => e.course?._id));
      });
    }
  }, [user]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    fetchCourses(keyword, cat);
  };

  const handleEnroll = async (courseId) => {
    if (!user) return navigate('/login');
    try {
      await axiosClient.post(`/enrollments/${courseId}`);
      alert('Ghi danh khóa học thành công!');
      setEnrolledIds([...enrolledIds, courseId]);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi ghi danh');
    }
  };

  return (
    <div>
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white py-14 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Nền tảng Học tập Trực tuyến Thế hệ mới</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Khám phá tri thức, bứt phá kỹ năng
          </h1>
          <p className="text-indigo-100 max-w-2xl mx-auto text-base md:text-lg">
            Tham gia các lớp học trực tuyến chất lượng cao, truy cập tài liệu học tập mọi lúc và theo dõi tiến độ theo thời gian thực.
          </p>

          {/* Thanh tìm kiếm nổi bật */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCourses();
            }}
            className="max-w-xl mx-auto flex shadow-xl rounded-xl overflow-hidden bg-white p-1.5"
          >
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập tên khóa học bạn muốn tìm..."
              className="w-full px-4 py-2.5 text-slate-800 outline-none text-sm"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Tìm kiếm</span>
            </button>
          </form>
        </div>
      </div>

      {/* NỘI DUNG DANH SÁCH KHÓA HỌC */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Thanh lọc danh mục */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="text-sm text-slate-500">
            Hiển thị <strong>{courses.length}</strong> khóa học
          </span>
        </div>

        {/* Trạng thái chưa có khóa học */}
        {courses.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <GraduationCap className="w-14 h-14 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Chưa có khóa học nào</h3>
            <p className="text-slate-500 text-sm mt-1">
              Hãy đăng nhập bằng tài khoản <strong>Giảng viên (Teacher)</strong> để tạo khóa học đầu tiên cho hệ thống!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.includes(course._id);
              const isOwner = user?._id === course.teacher?._id;

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    {/* Ảnh bìa Gradient của thẻ khóa học */}
                    <div className="h-32 bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 p-5 flex flex-col justify-between text-white">
                      <span className="self-start bg-black/25 backdrop-blur-xs text-xs font-semibold px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-indigo-100">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{course.materials?.length || 0} bài học & tài liệu</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 mb-4 pt-4 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {course.teacher?.fullName?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Giảng viên</p>
                        <p className="font-medium text-slate-700 leading-tight">
                          {course.teacher?.fullName}
                        </p>
                      </div>
                    </div>

                    {isEnrolled || isOwner || user?.role === 'admin' ? (
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer shadow-xs"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Vào lớp học</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer shadow-xs"
                      >
                        Ghi danh ngay (Enroll)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}