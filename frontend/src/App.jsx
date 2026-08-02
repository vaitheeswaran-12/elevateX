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
import JobsCatalogPage from './pages/JobsCatalogPage.jsx';

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

import InstructorDashboardLayout from './components/InstructorDashboardLayout.jsx';

// Instructor Subviews
import InstructorHomeView from './pages/instructor/HomeView.jsx';
import InstructorProfileView from './pages/instructor/ProfileView.jsx';
import InstructorCoursesView from './pages/instructor/CoursesView.jsx';
import InstructorCourseBuilderView from './pages/instructor/CourseBuilderView.jsx';
import InstructorQuizBuilderView from './pages/instructor/QuizBuilderView.jsx';
import InstructorAssignmentsView from './pages/instructor/AssignmentsView.jsx';
import InstructorStudentsListView from './pages/instructor/StudentsListView.jsx';
import InstructorReviewsView from './pages/instructor/ReviewsView.jsx';

// Recruiter Dashboard Sub-Routes
import RecruiterDashboardLayout from './components/RecruiterDashboardLayout.jsx';
import RecruiterHomeView from './pages/recruiter/HomeView.jsx';
import RecruiterJobsView from './pages/recruiter/JobsView.jsx';
import RecruiterCandidatesView from './pages/recruiter/CandidatesView.jsx';
import RecruiterProfileView from './pages/recruiter/ProfileView.jsx';
import RecruiterAnalyticsView from './pages/recruiter/AnalyticsView.jsx';

// Admin Dashboard Sub-Routes & Layout
import AdminDashboardLayout from './components/AdminDashboardLayout.jsx';
import AdminHomeView from './pages/admin/HomeView.jsx';
import AdminUsersView from './pages/admin/UsersView.jsx';
import AdminCoursesView from './pages/admin/CoursesView.jsx';
import AdminJobsView from './pages/admin/JobsView.jsx';
import AdminCertificatesView from './pages/admin/CertificatesView.jsx';
import AdminAnalyticsView from './pages/admin/AnalyticsView.jsx';
import AdminAuditLogsView from './pages/admin/AuditLogsView.jsx';
import AdminSettingsView from './pages/admin/SettingsView.jsx';

// Course Learning Engine Pages
import CoursePlayerPage from './pages/student/CoursePlayerPage.jsx';
import QuizPage from './pages/student/QuizPage.jsx';
import CertificateVerificationPage from './pages/student/CertificateVerificationPage.jsx';

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
                <Route path="/jobs" element={<JobsCatalogPage />} />

                {/* Student Dashboard Sub-Routes with Route Protections */}
                <Route path="/student-dashboard" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <HomeView />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/student-dashboard/course-player/:courseId" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <CoursePlayerPage />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/student-dashboard/quiz/:quizId" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardLayout>
                      <QuizPage />
                    </StudentDashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Public non-authenticated Verifiable Certificates Cryptographic Ledger route */}
                <Route path="/verify/:id" element={<CertificateVerificationPage />} />
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
                {/* Instructor Dashboard Sub-Routes with Route Protections */}
                <Route path="/instructor-dashboard" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboardLayout>
                      <InstructorHomeView />
                    </InstructorDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/instructor-dashboard/profile" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboardLayout>
                      <InstructorProfileView />
                    </InstructorDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/instructor-dashboard/courses" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboardLayout>
                      <InstructorCoursesView />
                    </InstructorDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/instructor-dashboard/course-builder/:courseId" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboardLayout>
                      <InstructorCourseBuilderView />
                    </InstructorDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/instructor-dashboard/quizzes" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboardLayout>
                      <InstructorQuizBuilderView />
                    </InstructorDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/instructor-dashboard/assignments" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboardLayout>
                      <InstructorAssignmentsView />
                    </InstructorDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/instructor-dashboard/students" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboardLayout>
                      <InstructorStudentsListView />
                    </InstructorDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/instructor-dashboard/reviews" element={
                  <ProtectedRoute allowedRoles={['instructor']}>
                    <InstructorDashboardLayout>
                      <InstructorReviewsView />
                    </InstructorDashboardLayout>
                  </ProtectedRoute>
                } />
                {/* Recruiter Dashboard Sub-Routes with Route Protections */}
                <Route path="/recruiter-dashboard" element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboardLayout>
                      <RecruiterHomeView />
                    </RecruiterDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter-dashboard/jobs" element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboardLayout>
                      <RecruiterJobsView />
                    </RecruiterDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter-dashboard/candidates" element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboardLayout>
                      <RecruiterCandidatesView />
                    </RecruiterDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter-dashboard/profile" element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboardLayout>
                      <RecruiterProfileView />
                    </RecruiterDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/recruiter-dashboard/analytics" element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboardLayout>
                      <RecruiterAnalyticsView />
                    </RecruiterDashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Admin Dashboard Sub-Routes with Route Protections */}
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardLayout>
                      <AdminHomeView />
                    </AdminDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardLayout>
                      <AdminUsersView />
                    </AdminDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/courses" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardLayout>
                      <AdminCoursesView />
                    </AdminDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/jobs" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardLayout>
                      <AdminJobsView />
                    </AdminDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/certificates" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardLayout>
                      <AdminCertificatesView />
                    </AdminDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/analytics" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardLayout>
                      <AdminAnalyticsView />
                    </AdminDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/logs" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardLayout>
                      <AdminAuditLogsView />
                    </AdminDashboardLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardLayout>
                      <AdminSettingsView />
                    </AdminDashboardLayout>
                  </ProtectedRoute>
                } />

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
