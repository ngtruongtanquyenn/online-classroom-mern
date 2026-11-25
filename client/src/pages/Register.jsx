import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  GraduationCap,
  BookOpenCheck,
  AlertCircle,
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.role
      );
      navigate(data.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-indigo-50/60 to-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80">
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Tạo tài khoản mới
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tham gia hệ thống học tập & giảng dạy trực tuyến
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
              Họ và tên
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition"
                placeholder="Nguyễn Văn A"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition"
                placeholder="user@classroom.com"
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
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition"
                placeholder="Tối thiểu 6 ký tự"
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

          {/* Chọn vai trò dạng thẻ trực quan */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Bạn tham gia với vai trò
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  formData.role === 'student'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/15'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <GraduationCap
                  className={`w-5 h-5 mb-1.5 ${
                    formData.role === 'student' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <p className="text-sm font-bold text-slate-800">Sinh viên</p>
                <p className="text-[11px] text-slate-500">Học tập & nộp bài</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'teacher' })}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  formData.role === 'teacher'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/15'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <BookOpenCheck
                  className={`w-5 h-5 mb-1.5 ${
                    formData.role === 'teacher' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <p className="text-sm font-bold text-slate-800">Giảng viên</p>
                <p className="text-[11px] text-slate-500">Tạo lớp & giảng dạy</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl shadow-sm transition cursor-pointer mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6 pt-5 border-t border-slate-100">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
