import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  GraduationCap,
  Bell,
  UserCog,
} from 'lucide-react';

const ROLE_LABELS = {
  admin: { label: 'Quản trị viên', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  teacher: { label: 'Giảng viên', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  student: { label: 'Sinh viên', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    if (user?.role === 'student') {
      axiosClient
        .get('/assignments/my-upcoming')
        .then(({ data }) => {
          const pending = data.filter((a) => !a.submitted);
          setUpcoming(pending);
        })
        .catch(() => setUpcoming([]));
    } else {
      setUpcoming([]);
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setBellOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'teacher') return '/teacher';
    return '/student';
  };

  const dashboardPath = getDashboardPath();
  const roleMeta = ROLE_LABELS[user?.role] || {
    label: user?.role?.toUpperCase(),
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center gap-4">
        {/* Brand */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 block">
              Online Classroom
            </span>
            <span className="text-[11px] font-medium text-slate-400 hidden sm:block">
              LMS Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
              isActive('/')
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Khóa học</span>
          </Link>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                  isActive(dashboardPath)
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              {/* Chuông nhắc hạn bài tập cho Sinh viên */}
              {user.role === 'student' && (
                <div className="relative">
                  <button
                    onClick={() => setBellOpen(!bellOpen)}
                    className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                    aria-label="Thông báo bài tập"
                  >
                    <Bell className="w-5 h-5" />
                    {upcoming.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {upcoming.length}
                      </span>
                    )}
                  </button>

                  {bellOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-50">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">
                          Bài tập chưa nộp ({upcoming.length})
                        </span>
                        <button
                          onClick={() => setBellOpen(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {upcoming.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">
                          Tuyệt vời! Bạn đã hoàn thành tất cả bài tập.
                        </p>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-1.5">
                          {upcoming.map((item) => (
                            <Link
                              key={item._id}
                              to={`/courses/${item.course?._id}`}
                              onClick={() => setBellOpen(false)}
                              className="block p-2.5 rounded-xl hover:bg-indigo-50/70 transition"
                            >
                              <p className="text-xs font-bold text-slate-800 line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {item.course?.title} • Hạn:{' '}
                                {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <Link
                to="/profile"
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition ${
                  isActive('/profile') ? 'bg-indigo-50' : 'hover:bg-slate-100'
                }`}
                title="Hồ sơ cá nhân"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-800 max-w-[140px] truncate">
                    {user.fullName}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleMeta.badge}`}
                  >
                    {roleMeta.label}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="ml-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  isActive('/login')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-sm transition"
              >
                Đăng ký miễn phí
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
          aria-label="Mở menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Khóa học</span>
          </Link>

          {user ? (
            <>
              <Link
                to={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>Dashboard ({roleMeta.label})</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <UserCog className="w-4 h-4 text-indigo-600" />
                <span>Hồ sơ cá nhân</span>
              </Link>

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.fullName}</p>
                    <p className="text-xs text-slate-500">{roleMeta.label}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Thoát</span>
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="text-center py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
