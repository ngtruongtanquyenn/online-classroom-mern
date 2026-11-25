import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  GraduationCap,
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

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
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

              <div className="h-6 w-px bg-slate-200 mx-1" />

              <div className="flex items-center gap-2.5 pl-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-800 max-w-[150px] truncate">
                    {user.fullName}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleMeta.badge}`}
                  >
                    {roleMeta.label}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Đăng xuất"
                className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition cursor-pointer"
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

              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
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
