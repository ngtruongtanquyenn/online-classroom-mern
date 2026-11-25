import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { FileText, Video, BookOpen, CheckCircle, Pencil, Trash2 } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('materials');

  // State form thêm tài liệu (Teacher)
  const [matForm, setMatForm] = useState({
    title: '',
    type: 'pdf',
    videoUrl: '',
    content: '',
  });
  const [matFile, setMatFile] = useState(null);

  // State chỉnh sửa tài liệu (Teacher)
  const [editingMatId, setEditingMatId] = useState(null);
  const [editMatForm, setEditMatForm] = useState({
    title: '',
    type: 'pdf',
    videoUrl: '',
    content: '',
  });
  const [editMatFile, setEditMatFile] = useState(null);

  // State form tạo bài tập (Teacher)
  const [assignForm, setAssignForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  // State nộp bài (Student)
  const [submitText, setSubmitText] = useState({});
  const [submitFile, setSubmitFile] = useState({});

  const isTeacherOwner =
    (user?.role === 'teacher' && course?.teacher?._id === user?._id) ||
    user?.role === 'admin';

  // Hàm chuẩn hóa URL file (hỗ trợ cả link Cloudinary https:// và link /uploads cũ)
  const getFileUrl = (url) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
  };

  const loadData = async () => {
    const [courseRes, assignRes] = await Promise.all([
      axiosClient.get(`/courses/${id}`),
      axiosClient.get(`/assignments/course/${id}`),
    ]);
    setCourse(courseRes.data);
    setAssignments(assignRes.data);

    if (user?.role === 'teacher' || user?.role === 'admin') {
      const stuRes = await axiosClient.get(`/enrollments/course/${id}/students`);
      setStudents(stuRes.data);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Teacher: Thêm tài liệu
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', matForm.title);
    formData.append('type', matForm.type);
    if (matForm.type === 'video') formData.append('videoUrl', matForm.videoUrl);
    if (matForm.type === 'reading') formData.append('content', matForm.content);
    if (matForm.type === 'pdf' && matFile) formData.append('file', matFile);

    await axiosClient.post(`/courses/${id}/materials`, formData);
    setMatForm({ title: '', type: 'pdf', videoUrl: '', content: '' });
    setMatFile(null);
    loadData();
  };

  // Teacher: Bật chế độ sửa tài liệu
  const startEditMaterial = (material) => {
    setEditingMatId(material._id);
    setEditMatForm({
      title: material.title || '',
      type: material.type || 'pdf',
      videoUrl: material.videoUrl || '',
      content: material.content || '',
    });
    setEditMatFile(null);
  };

  // Teacher: Lưu cập nhật tài liệu
  const handleUpdateMaterial = async (e, materialId) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editMatForm.title);
    formData.append('type', editMatForm.type);
    if (editMatForm.type === 'video') formData.append('videoUrl', editMatForm.videoUrl);
    if (editMatForm.type === 'reading') formData.append('content', editMatForm.content);
    if (editMatForm.type === 'pdf' && editMatFile) formData.append('file', editMatFile);

    await axiosClient.put(`/courses/${id}/materials/${materialId}`, formData);
    setEditingMatId(null);
    setEditMatFile(null);
    loadData();
  };

  // Teacher: Xóa tài liệu
  const handleDeleteMaterial = async (materialId, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tài liệu "${title}"?`)) return;
    await axiosClient.delete(`/courses/${id}/materials/${materialId}`);
    loadData();
  };

  // Student: Đánh dấu hoàn thành tài liệu
  const handleCompleteMaterial = async (materialId) => {
    const { data } = await axiosClient.put(
      `/enrollments/${id}/complete-material/${materialId}`
    );
    alert(`Đã cập nhật tiến độ học tập: ${data.progress}%`);
  };

  // Teacher: Tạo bài tập
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    await axiosClient.post('/assignments', { ...assignForm, courseId: id });
    setAssignForm({ title: '', description: '', dueDate: '' });
    loadData();
  };

  // Student: Nộp bài tập
  const handleSubmitAssignment = async (assignmentId) => {
    const formData = new FormData();
    if (submitText[assignmentId]) formData.append('textAnswer', submitText[assignmentId]);
    if (submitFile[assignmentId]) formData.append('file', submitFile[assignmentId]);

    await axiosClient.post(`/assignments/${assignmentId}/submit`, formData);
    alert('Nộp bài thành công!');
    loadData();
  };

  // Teacher: Chấm điểm
  const handleGrade = async (assignmentId, submissionId) => {
    const grade = prompt('Nhập điểm số (0 - 10):');
    if (grade === null) return;
    const feedback = prompt('Nhận xét của giảng viên:') || '';
    await axiosClient.put(`/assignments/${assignmentId}/grade/${submissionId}`, {
      grade: Number(grade),
      feedback,
    });
    loadData();
  };

  if (!course) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  // Lọc bỏ các bản ghi mồ côi nếu user đã bị xóa
  const validStudents = students.filter((en) => en.student !== null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
          {course.category}
        </span>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">{course.title}</h1>
        <p className="text-slate-600 mt-2">{course.description}</p>
        <p className="text-sm text-slate-500 mt-3">
          Giảng viên phụ trách: <strong>{course.teacher?.fullName}</strong>
        </p>
      </div>

      {/* Tabs điều hướng */}
      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 font-medium cursor-pointer ${
            activeTab === 'materials'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-600'
          }`}
        >
          Tài liệu học tập ({course.materials.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 font-medium cursor-pointer ${
            activeTab === 'assignments'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-600'
          }`}
        >
          Bài tập ({assignments.length})
        </button>
        {isTeacherOwner && (
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 font-medium cursor-pointer ${
              activeTab === 'students'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600'
            }`}
          >
            Sinh viên ghi danh ({validStudents.length})
          </button>
        )}
      </div>

      {/* TAB 1: TÀI LIỆU */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          {isTeacherOwner && (
            <form
              onSubmit={handleAddMaterial}
              className="bg-slate-50 p-5 rounded-xl border space-y-3"
            >
              <h3 className="font-bold text-slate-800">Đăng tải tài liệu mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Tiêu đề tài liệu"
                  value={matForm.title}
                  onChange={(e) => setMatForm({ ...matForm, title: e.target.value })}
                  className="px-3 py-2 border rounded-lg bg-white"
                />
                <select
                  value={matForm.type}
                  onChange={(e) => setMatForm({ ...matForm, type: e.target.value })}
                  className="px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="pdf">Tệp PDF / Tài liệu</option>
                  <option value="video">Link Video bài giảng</option>
                  <option value="reading">Bài đọc trực tiếp</option>
                </select>
              </div>

              {matForm.type === 'pdf' && (
                <input
                  type="file"
                  required
                  onChange={(e) => setMatFile(e.target.files[0])}
                  className="block text-sm"
                />
              )}
              {matForm.type === 'video' && (
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={matForm.videoUrl}
                  onChange={(e) => setMatForm({ ...matForm, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              )}
              {matForm.type === 'reading' && (
                <textarea
                  required
                  rows={3}
                  placeholder="Nội dung bài đọc..."
                  value={matForm.content}
                  onChange={(e) => setMatForm({ ...matForm, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
              )}

              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
              >
                Thêm tài liệu
              </button>
            </form>
          )}

          <div className="space-y-3">
            {course.materials.map((m) => (
              <div key={m._id} className="bg-white p-4 rounded-xl border">
                {editingMatId === m._id ? (
                  <form
                    onSubmit={(e) => handleUpdateMaterial(e, m._id)}
                    className="space-y-3 bg-slate-50 p-4 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        value={editMatForm.title}
                        onChange={(e) =>
                          setEditMatForm({ ...editMatForm, title: e.target.value })
                        }
                        className="px-3 py-2 border rounded-lg bg-white text-sm"
                      />
                      <select
                        value={editMatForm.type}
                        onChange={(e) =>
                          setEditMatForm({ ...editMatForm, type: e.target.value })
                        }
                        className="px-3 py-2 border rounded-lg bg-white text-sm"
                      >
                        <option value="pdf">Tệp PDF / Tài liệu</option>
                        <option value="video">Link Video bài giảng</option>
                        <option value="reading">Bài đọc trực tiếp</option>
                      </select>
                    </div>

                    {editMatForm.type === 'pdf' && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">
                          Chọn tệp mới nếu muốn thay thế tệp hiện tại:
                        </p>
                        <input
                          type="file"
                          onChange={(e) => setEditMatFile(e.target.files[0])}
                          className="block text-sm"
                        />
                      </div>
                    )}
                    {editMatForm.type === 'video' && (
                      <input
                        type="url"
                        required
                        value={editMatForm.videoUrl}
                        onChange={(e) =>
                          setEditMatForm({ ...editMatForm, videoUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                      />
                    )}
                    {editMatForm.type === 'reading' && (
                      <textarea
                        required
                        rows={3}
                        value={editMatForm.content}
                        onChange={(e) =>
                          setEditMatForm({ ...editMatForm, content: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                      />
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMatId(null)}
                        className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-start gap-3">
                      {m.type === 'pdf' && (
                        <FileText className="w-5 h-5 text-rose-500 mt-1" />
                      )}
                      {m.type === 'video' && (
                        <Video className="w-5 h-5 text-blue-500 mt-1" />
                      )}
                      {m.type === 'reading' && (
                        <BookOpen className="w-5 h-5 text-emerald-500 mt-1" />
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800">{m.title}</h4>
                        {m.type === 'pdf' && m.fileUrl && (
                          <a
                            href={getFileUrl(m.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            Tải xuống / Xem tài liệu
                          </a>
                        )}
                        {m.type === 'video' && (
                          <a
                            href={m.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            Mở liên kết Video bài giảng
                          </a>
                        )}
                        {m.type === 'reading' && (
                          <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                            {m.content}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user?.role === 'student' && (
                        <button
                          onClick={() => handleCompleteMaterial(m._id)}
                          className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Đánh dấu đã học</span>
                        </button>
                      )}

                      {isTeacherOwner && (
                        <>
                          <button
                            onClick={() => startEditMaterial(m)}
                            className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(m._id, m.title)}
                            className="flex items-center gap-1 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-medium cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BÀI TẬP */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {isTeacherOwner && (
            <form
              onSubmit={handleCreateAssignment}
              className="bg-slate-50 p-5 rounded-xl border space-y-3"
            >
              <h3 className="font-bold text-slate-800">Giao bài tập mới</h3>
              <input
                type="text"
                required
                placeholder="Tiêu đề bài tập"
                value={assignForm.title}
                onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
              <textarea
                required
                placeholder="Yêu cầu chi tiết bài tập..."
                value={assignForm.description}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
              <div>
                <label className="text-xs text-slate-600 block mb-1">Hạn nộp bài</label>
                <input
                  type="date"
                  required
                  value={assignForm.dueDate}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, dueDate: e.target.value })
                  }
                  className="px-3 py-2 border rounded-lg bg-white"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
              >
                Tạo bài tập
              </button>
            </form>
          )}

          {assignments.map((assign) => {
            const mySub = assign.submissions?.find(
              (s) => s.student?._id === user?._id
            );
            const validSubmissions =
              assign.submissions?.filter((sub) => sub.student !== null) || [];

            return (
              <div key={assign._id} className="bg-white p-6 rounded-xl border space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{assign.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{assign.description}</p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">
                    Hạn nộp: {new Date(assign.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Khu vực của Sinh viên */}
                {user?.role === 'student' && (
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    {mySub && (
                      <div className="text-sm bg-emerald-50 text-emerald-800 p-3 rounded-lg">
                        <p>
                          <strong>Trạng thái:</strong> Đã nộp bài |{' '}
                          <strong>Điểm số:</strong>{' '}
                          {mySub.grade !== null ? `${mySub.grade}/10` : 'Chưa chấm'}
                        </p>
                        {mySub.feedback && (
                          <p className="mt-1">
                            <strong>Nhận xét GV:</strong> {mySub.feedback}
                          </p>
                        )}
                      </div>
                    )}

                    <textarea
                      rows={2}
                      placeholder="Nhập câu trả lời dạng văn bản (tùy chọn)..."
                      value={submitText[assign._id] || ''}
                      onChange={(e) =>
                        setSubmitText({ ...submitText, [assign._id]: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg bg-white text-sm"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <input
                        type="file"
                        onChange={(e) =>
                          setSubmitFile({ ...submitFile, [assign._id]: e.target.files[0] })
                        }
                        className="text-xs"
                      />
                      <button
                        onClick={() => handleSubmitAssignment(assign._id)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
                      >
                        {mySub ? 'Nộp lại bài' : 'Nộp bài tập'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Khu vực chấm điểm của Giảng viên */}
                {isTeacherOwner && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">
                      Danh sách bài nộp ({validSubmissions.length})
                    </h4>
                    <div className="space-y-2">
                      {validSubmissions.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 p-3 rounded-lg text-sm gap-2"
                        >
                          <div>
                            <p className="font-semibold">{sub.student?.fullName}</p>
                            {sub.textAnswer && (
                              <p className="text-slate-600">Nội dung: {sub.textAnswer}</p>
                            )}
                            {sub.fileUrl && (
                              <a
                                href={getFileUrl(sub.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="text-indigo-600 underline"
                              >
                                Xem / Tải file đính kèm
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-emerald-700">
                              Điểm: {sub.grade !== null ? `${sub.grade}/10` : 'Chưa chấm'}
                            </span>
                            <button
                              onClick={() => handleGrade(assign._id, sub._id)}
                              className="bg-indigo-600 text-white px-3 py-1 rounded text-xs cursor-pointer"
                            >
                              Chấm điểm
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: DANH SÁCH SINH VIÊN */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Tiến độ học tập</th>
              </tr>
            </thead>
            <tbody>
              {validStudents.map((en) => (
                <tr key={en._id} className="border-b">
                  <td className="p-4 font-medium">{en.student?.fullName}</td>
                  <td className="p-4 text-slate-600">{en.student?.email}</td>
                  <td className="p-4 font-semibold text-indigo-600">{en.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}