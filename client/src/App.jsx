import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseDetail from './pages/CourseDetail';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/courses/:id"
                element={
                  <ProtectedRoute>
                    <CourseDetail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4">
              © {new Date().getFullYear()} Online Classroom MERN — Hệ thống Quản lý Lớp học Trực tuyến
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
