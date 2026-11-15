import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'teacher') return '/teacher';
    return '/student';
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="w-6 h-6" />
          <span>Online Classroom</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link to="/" className="hover:text-indigo-200 transition">
            Khóa học
          </Link>

          {user ? (
            <>
              <Link
                to={getDashboardPath()}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-sm font-medium transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>
                  Dashboard ({user.role.toUpperCase()})
                </span>
              </Link>
              <span className="text-sm hidden sm:inline text-indigo-100">
                Xin chào, <strong>{user.fullName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg text-sm transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Thoát</span>
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-lg border border-white/40 hover:bg-white/10 text-sm transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50 text-sm transition"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}