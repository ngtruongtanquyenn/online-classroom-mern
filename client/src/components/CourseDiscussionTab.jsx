import { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { Megaphone, Send, Trash2, MessageSquare } from 'lucide-react';

export default function CourseDiscussionTab({
  courseId,
  announcements,
  isTeacherOwner,
  onReload,
}) {
  const { toast, confirm } = useToast();
  const [form, setForm] = useState({ title: '', content: '' });
  const [posting, setPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});

  const handleCreate = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await axiosClient.post(`/announcements/course/${courseId}`, form);
      setForm({ title: '', content: '' });
      toast.success('Đã đăng thông báo lớp học');
      onReload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi đăng thông báo');
    } finally {
      setPosting(false);
    }
  };

  const handleAddComment = async (e, announcementId) => {
    e.preventDefault();
    const content = (commentInputs[announcementId] || '').trim();
    if (!content) return;
    try {
      await axiosClient.post(`/announcements/${announcementId}/comments`, {
        content,
      });
      setCommentInputs({ ...commentInputs, [announcementId]: '' });
      onReload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi bình luận');
    }
  };

  const handleDelete = async (announcement) => {
    const ok = await confirm({
      title: 'Xóa thông báo',
      message: `Xóa thông báo "${announcement.title}"?`,
      confirmText: 'Xóa',
    });
    if (!ok) return;
    try {
      await axiosClient.delete(`/announcements/${announcement._id}`);
      toast.success('Đã xóa thông báo');
      onReload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa thông báo');
    }
  };

  return (
    <div className="space-y-6">
      {isTeacherOwner && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900">Đăng thông báo / Thảo luận mới</h3>
          </div>

          <input
            type="text"
            required
            placeholder="Tiêu đề thông báo (VD: Lịch ôn tập giữa kỳ, Nhắc nộp bài...)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
          />
          <textarea
            required
            rows={3}
            placeholder="Nội dung chi tiết gửi đến cả lớp..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={posting}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition"
          >
            <Send className="w-4 h-4" />
            <span>{posting ? 'Đang đăng...' : 'Đăng thông báo'}</span>
          </button>
        </form>
      )}

      {announcements.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
          Chưa có thông báo hay thảo luận nào trong lớp học này.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {item.author?.avatar ? (
                    <img
                      src={item.author.avatar}
                      alt={item.author.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {item.author?.fullName?.charAt(0).toUpperCase() || 'G'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500">
                      {item.author?.fullName} •{' '}
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {isTeacherOwner && (
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {item.content}
              </p>

              {/* Bình luận hỏi đáp */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Trao đổi ({item.comments?.length || 0})</span>
                </div>

                {item.comments?.length > 0 && (
                  <div className="space-y-2">
                    {item.comments.map((c) => (
                      <div
                        key={c._id}
                        className="bg-slate-50 px-3.5 py-2.5 rounded-xl text-xs space-y-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800">
                            {c.author?.fullName}
                            {c.author?.role === 'teacher' && (
                              <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                                GV
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => handleAddComment(e, item._id)}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Viết câu hỏi hoặc phản hồi..."
                    value={commentInputs[item._id] || ''}
                    onChange={(e) =>
                      setCommentInputs({ ...commentInputs, [item._id]: e.target.value })
                    }
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                  >
                    Gửi
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
