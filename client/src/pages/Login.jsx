import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, GraduationCap, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-indigo-50/60 to-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80">
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Chào mừng trở lại
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Đăng nhập để tiếp tục học tập và quản lý lớp học
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-sm mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Hiện hoặc ẩn mật khẩu"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl shadow-sm transition cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6 pt-5 border-t border-slate-100">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
