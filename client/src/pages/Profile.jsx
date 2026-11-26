import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Lock, Camera, Save, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await axiosClient.put('/auth/profile', formData);
      updateUser(data);
      setAvatarFile(null);
      toast.success('Cập nhật hồ sơ cá nhân thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }

    setSavingPassword(true);
    try {
      await axiosClient.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Đổi mật khẩu thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Hồ sơ cá nhân
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý thông tin hiển thị, ảnh đại diện và bảo mật tài khoản của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Card thông tin cá nhân */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5"
        >
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <User className="w-5 h-5 text-indigo-600" />
            <span>Thông tin tài khoản</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-slate-100">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.fullName}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-xs">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <label
                title="Đổi ảnh đại diện"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-50 cursor-pointer transition"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center sm:text-left">
              <p className="font-bold text-slate-900 text-lg">{user?.fullName}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                <ShieldCheck className="w-3 h-3" />
                {user?.role}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Giới thiệu bản thân
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Chia sẻ đôi nét về chuyên ngành, sở thích hoặc kinh nghiệm giảng dạy..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Đang lưu...' : 'Lưu thông tin'}</span>
          </button>
        </form>

        {/* Card đổi mật khẩu */}
        <form
          onSubmit={handleChangePassword}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Lock className="w-5 h-5 text-indigo-600" />
            <span>Đổi mật khẩu</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition"
          >
            {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
