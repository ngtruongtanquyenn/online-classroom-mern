import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    axiosClient.get('/enrollments/my-enrollments').then(({ data }) => {
      setEnrollments(data);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Khóa học của tôi & Tiến trình học tập
      </h1>

      {enrollments.length === 0 ? (
        <div className="bg-white p-8 rounded-xl text-center border">
          <p className="text-slate-600 mb-4">Bạn chưa ghi danh khóa học nào.</p>
          <Link
            to="/"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg inline-block"
          >
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {item.course?.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Giảng viên: {item.course?.teacher?.fullName}
              </p>

              {/* Thanh tiến trình */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Tiến độ hoàn thành</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              <Link
                to={`/courses/${item.course?._id}`}
                className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium"
              >
                Tiếp tục học
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}