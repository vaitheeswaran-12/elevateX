import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import EmailVerificationPage from './pages/EmailVerificationPage.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import StudentDashboardLayout from './components/StudentDashboardLayout.jsx';

// Student Subviews
import HomeView from './pages/student/HomeView.jsx';
import ProfileView from './pages/student/ProfileView.jsx';
import CoursesView from './pages/student/CoursesView.jsx';
import JobsView from './pages/student/JobsView.jsx';
import CertificatesView from './pages/student/CertificatesView.jsx';
import NotificationsView from './pages/student/NotificationsView.jsx';
import SettingsView from './pages/student/SettingsView.jsx';
function InstructorDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Instructor Studio</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Successfully loaded instructor workspace!</p>
    </div>
  );
}
function RecruiterDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Recruitment Pipeline</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Successfully loaded recruiter portal!</p>
    </div>
  );
}
function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Platform Administration</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Successfully loaded admin command center!</p>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Elegant Header Layout */}
            <Navbar />

            {/* Application Main Content */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/verify-email" element={<EmailVerificationPage />} />

                {/* Student Dashboard Sub-Routes with Route Protections */}
                <Route path="/student-dashboard" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <HomeView />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/student-dashboard/profile" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <ProfileView />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/student-dashboard/courses" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <CoursesView />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/student-dashboard/jobs" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <JobsView />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/student-dashboard/certificates" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <CertificatesView />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/student-dashboard/notifications" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <NotificationsView />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/student-dashboard/settings" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <SettingsView />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Other dashboards */}
                <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
                <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                {/* Redirect all unmatched routes back to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* High Fidelity SaaS Footer */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
