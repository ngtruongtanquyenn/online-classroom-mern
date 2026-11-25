import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Compass,
} from 'lucide-react';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    axiosClient
      .get('/enrollments/my-enrollments')
      .then(({ data }) => {
        setEnrollments(data.filter((item) => item.course));
      })
      .finally(() => setLoading(false));
  }, []);

  const completedCount = enrollments.filter((e) => e.progress >= 100).length;
  const avgProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            Bảng điều khiển Sinh viên
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Xin chào, {user?.fullName} 👋
          </h1>
          <p className="text-indigo-100 text-sm mt-1.5">
            Theo dõi các lớp học đã ghi danh và tiến trình hoàn thành học liệu của bạn.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition self-start md:self-auto shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Khám phá thêm khóa học</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Khóa học đang theo</p>
            <p className="text-2xl font-extrabold text-slate-900">{enrollments.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tiến độ trung bình</p>
            <p className="text-2xl font-extrabold text-slate-900">{avgProgress}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Đã hoàn thành 100%</p>
            <p className="text-2xl font-extrabold text-slate-900">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          Khóa học của tôi ({enrollments.length})
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-2.5 bg-slate-200 rounded-full w-full" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-slate-300 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Bạn chưa ghi danh khóa học nào</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              Hãy dạo quanh danh mục khóa học và đăng ký lớp học đầu tiên của bạn.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
            >
              <span>Khám phá khóa học</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item) => {
              const isDone = item.progress >= 100;
              return (
                <div
                  key={item._id}
                  className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/90 hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                        {item.course?.category || 'Khóa học'}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isDone ? 'Hoàn thành' : 'Đang học'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                      {item.course?.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-5">
                      Giảng viên:{' '}
                      <span className="font-medium text-slate-700">
                        {item.course?.teacher?.fullName}
                      </span>
                    </p>
                  </div>

                  <div>
                    {/* Thanh tiến trình */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                        <span>Tiến độ hoàn thành</span>
                        <span className={isDone ? 'text-emerald-600' : 'text-indigo-600'}>
                          {item.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            isDone
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              : 'bg-gradient-to-r from-indigo-600 to-violet-500'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/courses/${item.course?._id}`}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                      <span>{isDone ? 'Xem lại bài học' : 'Tiếp tục học'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
