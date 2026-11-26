import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import {
  HelpCircle,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  Play,
  Award,
  XCircle,
} from 'lucide-react';

export default function CourseQuizzesTab({
  courseId,
  quizzes,
  isTeacherOwner,
  user,
  onReload,
}) {
  const { toast, confirm } = useToast();

  // State tạo bài kiểm tra mới (Teacher / Admin)
  const [showForm, setShowForm] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: 15,
    questions: [
      { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 },
    ],
  });
  const [creating, setCreating] = useState(false);

  // State làm bài (Student)
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const activeQuiz = quizzes.find((q) => q._id === activeQuizId);

  // Đồng hồ đếm ngược khi đang làm bài
  useEffect(() => {
    if (!activeQuizId || secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz(activeQuizId, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuizId, secondsLeft]);

  const addQuestionField = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 },
      ],
    }));
  };

  const removeQuestionField = (qIdx) => {
    if (quizForm.questions.length <= 1) return;
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIdx),
    }));
  };

  const updateQuestion = (qIdx, field, value) => {
    setQuizForm((prev) => {
      const next = [...prev.questions];
      next[qIdx] = { ...next[qIdx], [field]: value };
      return { ...prev, questions: next };
    });
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuizForm((prev) => {
      const next = [...prev.questions];
      const opts = [...next[qIdx].options];
      opts[optIdx] = value;
      next[qIdx] = { ...next[qIdx], options: opts };
      return { ...prev, questions: next };
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axiosClient.post('/quizzes', { ...quizForm, courseId });
      toast.success('Đã tạo bài kiểm tra trắc nghiệm!');
      setShowForm(false);
      setQuizForm({
        title: '',
        description: '',
        timeLimit: 15,
        questions: [
          { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 },
        ],
      });
      onReload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi tạo bài kiểm tra');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    const ok = await confirm({
      title: 'Xóa bài kiểm tra',
      message: `Bạn có chắc muốn xóa bài kiểm tra "${quiz.title}"?`,
      confirmText: 'Xóa bài kiểm tra',
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/quizzes/${quiz._id}`);
      toast.success('Đã xóa bài kiểm tra');
      onReload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bài kiểm tra');
    }
  };

  const startQuiz = (quiz) => {
    setActiveQuizId(quiz._id);
    setAnswers({});
    setSecondsLeft((quiz.timeLimit || 15) * 60);
  };

  const handleSubmitQuiz = async (quizId, isAuto = false) => {
    if (submitting) return;
    const quiz = quizzes.find((q) => q._id === quizId);
    if (!quiz) return;

    setSubmitting(true);
    try {
      const answerList = quiz.questions.map((_, idx) =>
        answers[idx] !== undefined ? Number(answers[idx]) : -1
      );
      const { data } = await axiosClient.post(`/quizzes/${quizId}/submit`, {
        answers: answerList,
      });
      setActiveQuizId(null);
      toast.success(
        isAuto ? `Hết giờ! ${data.message}` : data.message
      );
      onReload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi nộp bài trắc nghiệm');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {isTeacherOwner && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900">Bài kiểm tra trắc nghiệm</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              <span>{showForm ? 'Đóng biểu mẫu' : 'Tạo bài trắc nghiệm'}</span>
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreateQuiz} className="space-y-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Tiêu đề bài kiểm tra..."
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="md:col-span-2 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600 shrink-0">
                    Thời gian (phút):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={quizForm.timeLimit}
                    onChange={(e) =>
                      setQuizForm({ ...quizForm, timeLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Mô tả ngắn (tùy chọn)..."
                value={quizForm.description}
                onChange={(e) =>
                  setQuizForm({ ...quizForm, description: e.target.value })
                }
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500"
              />

              <div className="space-y-4">
                {quizForm.questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-700">
                        Câu hỏi {qIdx + 1}
                      </span>
                      {quizForm.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestionField(qIdx)}
                          className="text-xs text-rose-600 hover:underline cursor-pointer"
                        >
                          Xóa câu này
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Nhập nội dung câu hỏi..."
                      value={q.questionText}
                      onChange={(e) =>
                        updateQuestion(qIdx, 'questionText', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctOptionIndex === optIdx}
                            onChange={() =>
                              updateQuestion(qIdx, 'correctOptionIndex', optIdx)
                            }
                            title="Chọn làm đáp án đúng"
                            className="cursor-pointer"
                          />
                          <input
                            type="text"
                            required
                            placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                            value={opt}
                            onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      * Chọn nút tròn bên trái đáp án đúng.
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={addQuestionField}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm câu hỏi</span>
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                >
                  {creating ? 'Đang lưu...' : 'Xuất bản bài kiểm tra'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Giao diện làm bài trắc nghiệm của Sinh viên */}
      {activeQuiz && user?.role === 'student' && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-500 shadow-lg space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Đang làm bài: {activeQuiz.title}
              </h3>
              <p className="text-xs text-slate-500">
                Tổng số {activeQuiz.questions.length} câu hỏi
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatTimer(secondsLeft)}</span>
            </div>
          </div>

          <div className="space-y-5">
            {activeQuiz.questions.map((q, qIdx) => (
              <div key={q._id || qIdx} className="space-y-2.5">
                <p className="font-semibold text-slate-800 text-sm">
                  Câu {qIdx + 1}: {q.questionText}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const selected = answers[qIdx] === optIdx;
                    return (
                      <button
                        type="button"
                        key={optIdx}
                        onClick={() => setAnswers({ ...answers, [qIdx]: optIdx })}
                        className={`text-left px-4 py-2.5 rounded-xl border text-sm transition cursor-pointer ${
                          selected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-800 font-semibold'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="font-bold mr-2">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveQuizId(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
            >
              Thoát
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmitQuiz(activeQuiz._id, false)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold cursor-pointer"
            >
              {submitting ? 'Đang chấm điểm...' : 'Nộp bài kiểm tra'}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách bài kiểm tra */}
      {quizzes.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 text-sm">
          Chưa có bài kiểm tra trắc nghiệm nào trong khóa học này.
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz) => {
            const myAttempt = quiz.myAttempt;
            return (
              <div
                key={quiz._id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{quiz.title}</h4>
                    {quiz.description && (
                      <p className="text-sm text-slate-600 mt-1">{quiz.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                        {quiz.questions.length} câu hỏi
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {quiz.timeLimit} phút
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {user?.role === 'student' && activeQuizId !== quiz._id && (
                      <button
                        onClick={() => startQuiz(quiz)}
                        className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{myAttempt ? 'Làm lại bài' : 'Bắt đầu làm bài'}</span>
                      </button>
                    )}

                    {isTeacherOwner && (
                      <button
                        onClick={() => handleDeleteQuiz(quiz)}
                        className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70 px-3 py-2 rounded-xl font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Kết quả & đáp án chi tiết của sinh viên sau khi làm */}
                {user?.role === 'student' && myAttempt && (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800">
                        <Award className="w-4 h-4 text-amber-500" />
                        Kết quả gần nhất: {myAttempt.score}/10 (Đúng{' '}
                        {myAttempt.correctCount}/{myAttempt.totalQuestions} câu)
                      </span>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-emerald-200/60">
                      {quiz.questions.map((q, idx) => {
                        const chosen = myAttempt.answers?.[idx];
                        const isRight = chosen === q.correctOptionIndex;
                        return (
                          <div
                            key={q._id || idx}
                            className="text-xs flex items-start gap-2 text-slate-700"
                          >
                            {isRight ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-semibold">
                                Câu {idx + 1}: {q.questionText}
                              </span>{' '}
                              <span className="text-emerald-700 font-medium">
                                (Đáp án đúng:{' '}
                                {String.fromCharCode(65 + q.correctOptionIndex)}.{' '}
                                {q.options[q.correctOptionIndex]})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bảng kết quả sinh viên cho Giảng viên / Admin */}
                {isTeacherOwner && (
                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      Lượt làm bài của sinh viên ({quiz.attempts?.length || 0})
                    </p>
                    {!quiz.attempts || quiz.attempts.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Chưa có sinh viên nào làm bài kiểm tra này.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {quiz.attempts.map((a) => (
                          <div
                            key={a._id}
                            className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70 text-xs"
                          >
                            <span className="font-semibold text-slate-800 truncate pr-2">
                              {a.student?.fullName || 'Sinh viên'}
                            </span>
                            <span className="font-bold text-emerald-700 shrink-0">
                              {a.score}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
