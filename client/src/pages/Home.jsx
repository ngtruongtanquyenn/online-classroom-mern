import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'Tất cả',
  'Lập trình Web',
  'Cơ sở dữ liệu',
  'Trí tuệ nhân tạo',
  'Kỹ thuật phần mềm',
];

const COVER_GRADIENTS = [
  'from-indigo-600 via-blue-600 to-cyan-500',
  'from-violet-600 via-purple-600 to-fuchsia-500',
  'from-emerald-600 via-teal-600 to-cyan-600',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-sky-600 via-indigo-600 to-violet-600',
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [enrolledIds, setEnrolledIds] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCourses = async (searchKey = keyword, cat = selectedCategory) => {
    try {
      setLoading(true);
      const categoryParam = cat === 'Tất cả' ? 'All' : cat;
      const { data } = await axiosClient.get(
        `/courses?keyword=${encodeURIComponent(searchKey)}&category=${encodeURIComponent(categoryParam)}`
      );
      setCourses(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    if (user?.role === 'student') {
      axiosClient.get('/enrollments/my-enrollments').then(({ data }) => {
        setEnrolledIds(data.map((e) => e.course?._id));
      });
    } else {
      setEnrolledIds([]);
    }
  }, [user]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    fetchCourses(keyword, cat);
  };

  const handleClearSearch = () => {
    setKeyword('');
    fetchCourses('', selectedCategory);
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
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-800 to-violet-800 text-white py-16 md:py-20 px-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-fuchsia-500/20 blur-3xl"
        />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-indigo-100">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Nền tảng Học tập Trực tuyến Thế hệ mới</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Khám phá tri thức,{' '}
            <span className="bg-gradient-to-r from-amber-200 via-cyan-200 to-white bg-clip-text text-transparent">
              bứt phá kỹ năng
            </span>
          </h1>

          <p className="text-indigo-100/90 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Tham gia các lớp học trực tuyến chất lượng cao, truy cập học liệu đa dạng, nộp bài tập và theo dõi tiến độ theo thời gian thực.
          </p>

          {/* Thanh tìm kiếm */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchCourses();
            }}
            className="max-w-xl mx-auto flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white p-1.5 ring-4 ring-white/15"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm tên khóa học, chủ đề..."
                className="w-full px-3 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none text-sm"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  aria-label="Xóa từ khóa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 sm:px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer shrink-0 shadow-sm"
            >
              <span>Tìm kiếm</span>
            </button>
          </form>
        </div>
      </section>

      {/* DANH SÁCH KHÓA HỌC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Thanh lọc danh mục */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-sm text-slate-500 bg-white border border-slate-200/80 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
            Hiển thị <strong className="text-slate-800">{courses.length}</strong> khóa học
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse"
              >
                <div className="h-32 bg-slate-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-10 bg-slate-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy khóa học phù hợp</h3>
            <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
              Thử thay đổi từ khóa tìm kiếm, chọn danh mục khác hoặc đăng nhập bằng tài khoản{' '}
              <strong>Giảng viên</strong> để tạo khóa học mới.
            </p>
            {(keyword || selectedCategory !== 'Tất cả') && (
              <button
                onClick={() => {
                  setKeyword('');
                  setSelectedCategory('Tất cả');
                  fetchCourses('', 'Tất cả');
                }}
                className="mt-5 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-semibold cursor-pointer transition"
              >
                Xem tất cả khóa học
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {courses.map((course, idx) => {
              const isEnrolled = enrolledIds.includes(course._id);
              const isOwner = user?._id === course.teacher?._id;
              const gradient = COVER_GRADIENTS[idx % COVER_GRADIENTS.length];

              return (
                <article
                  key={course._id}
                  className="group bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    {/* Ảnh bìa Gradient */}
                    <div
                      className={`h-36 bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between text-white relative overflow-hidden`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="bg-black/20 backdrop-blur-xs border border-white/15 text-xs font-semibold px-3 py-1 rounded-full">
                          {course.category}
                        </span>
                        {isEnrolled && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã ghi danh</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{course.materials?.length || 0} bài học & tài liệu</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600 mb-5 pt-4 border-t border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {course.teacher?.fullName?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                          Giảng viên
                        </p>
                        <p className="font-semibold text-slate-700 truncate">
                          {course.teacher?.fullName}
                        </p>
                      </div>
                    </div>

                    {isEnrolled || isOwner || user?.role === 'admin' ? (
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition cursor-pointer shadow-xs"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Vào lớp học</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition cursor-pointer shadow-xs"
                      >
                        <span>Ghi danh ngay</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
