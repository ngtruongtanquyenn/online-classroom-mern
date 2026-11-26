import { Download, Table } from 'lucide-react';

export default function CourseGradebookTab({
  courseTitle,
  students,
  assignments,
  quizzes,
}) {
  const getStudentAssignmentScore = (assignment, studentId) => {
    const sub = assignment.submissions?.find(
      (s) => s.student?._id === studentId || s.student === studentId
    );
    return sub && sub.grade !== null && sub.grade !== undefined ? sub.grade : null;
  };

  const getStudentQuizScore = (quiz, studentId) => {
    const attempt = quiz.attempts?.find(
      (a) => a.student?._id === studentId || a.student === studentId
    );
    return attempt ? attempt.score : null;
  };

  const computeAverage = (studentId) => {
    const scores = [];
    assignments.forEach((a) => {
      const s = getStudentAssignmentScore(a, studentId);
      if (s !== null) scores.push(s);
    });
    quizzes.forEach((q) => {
      const s = getStudentQuizScore(q, studentId);
      if (s !== null) scores.push(s);
    });
    if (scores.length === 0) return '—';
    const avg = scores.reduce((acc, v) => acc + v, 0) / scores.length;
    return avg.toFixed(1);
  };

  const exportCsv = () => {
    const headers = [
      'Họ và tên',
      'Email',
      'Tiến độ (%)',
      ...assignments.map((a) => `BT: ${a.title}`),
      ...quizzes.map((q) => `Quiz: ${q.title}`),
      'Điểm TB',
    ];

    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = students.map((en) => {
      const sid = en.student?._id;
      return [
        en.student?.fullName || '',
        en.student?.email || '',
        en.progress ?? 0,
        ...assignments.map((a) => {
          const s = getStudentAssignmentScore(a, sid);
          return s !== null ? s : '';
        }),
        ...quizzes.map((q) => {
          const s = getStudentQuizScore(q, sid);
          return s !== null ? s : '';
        }),
        computeAverage(sid),
      ].map(escapeCsv);
    });

    const csvContent =
      '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bang-diem-${courseTitle || 'lop-hoc'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-bold text-slate-900">Bảng điểm tổng hợp lớp</h3>
            <p className="text-xs text-slate-500">
              Tổng hợp điểm bài tập, trắc nghiệm và tiến độ học tập
            </p>
          </div>
        </div>
        <button
          onClick={exportCsv}
          disabled={students.length === 0}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Xuất bảng điểm (.csv)</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 text-xs uppercase">
            <tr>
              <th className="p-4 font-semibold">Sinh viên</th>
              <th className="p-4 font-semibold">Tiến độ</th>
              {assignments.map((a) => (
                <th key={a._id} className="p-4 font-semibold whitespace-nowrap">
                  BT: {a.title}
                </th>
              ))}
              {quizzes.map((q) => (
                <th key={q._id} className="p-4 font-semibold whitespace-nowrap">
                  Quiz: {q.title}
                </th>
              ))}
              <th className="p-4 font-semibold text-right">Điểm TB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + assignments.length + quizzes.length}
                  className="p-8 text-center text-slate-500"
                >
                  Chưa có sinh viên ghi danh trong lớp này.
                </td>
              </tr>
            ) : (
              students.map((en) => {
                const sid = en.student?._id;
                return (
                  <tr key={en._id} className="hover:bg-slate-50/70">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{en.student?.fullName}</p>
                      <p className="text-xs text-slate-400">{en.student?.email}</p>
                    </td>
                    <td className="p-4 font-semibold text-indigo-600">{en.progress}%</td>
                    {assignments.map((a) => {
                      const s = getStudentAssignmentScore(a, sid);
                      return (
                        <td key={a._id} className="p-4 text-slate-700">
                          {s !== null ? (
                            <span className="font-bold text-emerald-700">{s}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    {quizzes.map((q) => {
                      const s = getStudentQuizScore(q, sid);
                      return (
                        <td key={q._id} className="p-4 text-slate-700">
                          {s !== null ? (
                            <span className="font-bold text-indigo-700">{s}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-right font-extrabold text-slate-900">
                      {computeAverage(sid)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
