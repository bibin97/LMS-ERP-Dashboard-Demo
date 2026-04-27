import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import MentorLayout from './components/Mentor/MentorLayout';
import StudentLayout from './layouts/StudentLayout';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import Mentors from './pages/admin/Mentors';
import Faculties from './pages/admin/Faculties';
import Tasks from './pages/admin/Tasks';
import Reports from './pages/admin/Reports';
import InteractionLogs from './pages/admin/InteractionLogs';
import Approvals from './pages/admin/Approvals';
import DailyMentorHeadReport from './pages/admin/DailyMentorHeadReport';
import AdminManagement from './pages/admin/AdminManagement';
import StaffManagement from './pages/admin/StaffManagement';
import AdminLiveMonitoring from './pages/admin/LiveMonitoring';
import AdminProfile from './pages/common/Profile';

// Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentSchedule from './pages/student/Schedule';

// Mentor Panel Pages
import MentorDashboard from './pages/Mentor/MentorDashboard';
import MyStudents from './pages/Mentor/MyStudents';
import StudentDetails from './pages/Mentor/StudentDetails';
import MyTasks from './pages/Mentor/MyTasks';
import Timetable from './pages/Mentor/Timetable';
import StudentInteractionLog from './pages/Mentor/StudentInteractionLog';
import FacultyInteractionLog from './pages/Mentor/FacultyInteractionLog';
import Exams from './pages/Mentor/Exams';
import AcademicSchedule from './pages/Mentor/AcademicSchedule';
import StudentsData from './pages/Mentor/StudentsData';

// Faculty Panel Pages
import FacultyLayout from './components/Faculty/FacultyLayout';
import FacultyDashboard from './pages/Faculty/FacultyDashboard';
import FacultyStudents from './pages/Faculty/MyStudents';
import FacultySessions from './pages/Faculty/FacultySessions';
import FacultyReports from './pages/Faculty/FacultyReports';
import FacultyExams from './pages/Faculty/FacultyExams';
import StudentLogs from './pages/Faculty/StudentLogs';
import FacultyTasks from './pages/Faculty/FacultyTasks';
import FacultyDocuments from './pages/Faculty/FacultyDocuments';
import FacultyNotifications from './pages/Faculty/FacultyNotifications';
import FacultyStudentDetails from './pages/Mentor/StudentDetails'; // Fixed potential duplicate or incorrect import path if needed, but keeping it as is for now if it works.
// Note: We are now using common Profile for all.

// Mentor Head Pages
import MentorHeadLayout from './components/MentorHead/MentorHeadLayout';
import MentorHeadDashboard from './pages/MentorHead/MentorHeadDashboard';
import MentorRegistration from './pages/MentorHead/MentorRegistration';
import MentorsList from './pages/MentorHead/MentorsList';
import CourseCompletedTracker from './pages/MentorHead/CourseCompletedTracker';
import MentorDetails from './pages/MentorHead/MentorDetails';
import StudentCheckTracker from './pages/MentorHead/StudentCheckTracker';
import StudentShift from './pages/MentorHead/StudentShift';
import MentorHeadInteractions from './pages/MentorHead/MentorHeadInteractions';
import MentorHeadTasks from './pages/MentorHead/MentorHeadTasks';

// Academic Head Pages
import AcademicHeadLayout from './components/AcademicHead/AcademicHeadLayout';
import AcademicHeadDashboard from './pages/AcademicHead/AcademicHeadDashboard';
import Registrations from './pages/AcademicHead/Registrations';
import AcademicHeadTasks from './pages/AcademicHead/AcademicHeadTasks';
import AcademicHeadFacultyActivity from './pages/AcademicHead/AcademicHeadFacultyActivity';
import AcademicActions from './pages/AcademicHead/AcademicActions';
import FacultyDirectory from './pages/AcademicHead/FacultyDirectory';
import StudentsListAcademic from './pages/AcademicHead/StudentsList';
import MentorsListAcademic from './pages/AcademicHead/MentorsList';
import Documents from './pages/AcademicHead/Documents';
import FacultyAudit from './pages/AcademicHead/FacultyAudit';
import StudentLogsAcademic from './pages/AcademicHead/StudentLogs';
import FacultyLogsAcademic from './pages/AcademicHead/FacultyLogs';
import CheckingSection from './pages/AcademicHead/CheckingSection';
import AcademicLiveMonitoring from './pages/AcademicHead/LiveMonitoring';

// Mentor Head Additional Pages
import FacultyDirectoryMentorHead from './pages/MentorHead/FacultyDirectory';
import StudentsListMentorHead from './pages/AcademicHead/StudentsList'; // Reusing StudentsList logic for AH/MH if compatible, or I'll create a dedicated one if needed. Actually I created StudentsList.jsx in AH, I should check if it's reusable.

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'rounded-2xl font-bold text-sm shadow-xl',
            duration: 3000,
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes (Super Admin) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="mentors" element={<Mentors />} />
            <Route path="faculties" element={<Faculties />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="reports" element={<Reports />} />
            <Route path="mentor-head-report" element={<DailyMentorHeadReport />} />
            <Route path="logs" element={<InteractionLogs />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="admin-management" element={<AdminManagement />} />
            <Route path="live-monitoring" element={<AdminLiveMonitoring />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Mentor Head System */}
          <Route path="/mentor-head" element={
            <ProtectedRoute allowedRoles={['mentor_head']}>
              <MentorHeadLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/mentor-head/dashboard" replace />} />
            <Route path="dashboard" element={<MentorHeadDashboard />} />
            <Route path="checks" element={<StudentCheckTracker />} />
            <Route path="shift" element={<StudentShift />} />
            <Route path="register-mentor" element={<MentorRegistration />} />
            <Route path="mentors" element={<MentorsList />} />
            <Route path="mentors/:id" element={<MentorDetails />} />
            <Route path="students" element={<StudentsListAcademic role="mentor_head" />} /> {/* Route for student management */}
            <Route path="faculties" element={<FacultyDirectoryMentorHead />} />
            <Route path="course-completed" element={<CourseCompletedTracker />} />
            <Route path="tasks" element={<MentorHeadTasks />} />
            <Route path="interactions" element={<MentorHeadInteractions />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Academic Head System */}
          <Route path="/academic-head" element={
            <ProtectedRoute allowedRoles={['academic_head']}>
              <AcademicHeadLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/academic-head/dashboard" replace />} />
            <Route path="dashboard" element={<AcademicHeadDashboard />} />
            <Route path="actions" element={<AcademicActions />} />
            <Route path="faculties" element={<FacultyDirectory />} />
            <Route path="students" element={<StudentsListAcademic role="academic_head" />} />
            <Route path="mentors" element={<MentorsListAcademic />} />
            <Route path="documents" element={<Documents />} />
            <Route path="faculty-audit" element={<FacultyAudit />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="tasks" element={<AcademicHeadTasks />} />
            <Route path="faculty-activity" element={<AcademicHeadFacultyActivity />} />
            <Route path="student-logs" element={<StudentLogsAcademic />} />
            <Route path="faculty-logs" element={<FacultyLogsAcademic />} />
            <Route path="checking" element={<CheckingSection />} />
            <Route path="live-monitoring" element={<AcademicLiveMonitoring />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Faculty System */}
          <Route path="/faculty" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="students" element={<FacultyStudents />} />
            <Route path="students/:id" element={<FacultyStudentDetails />} />
            <Route path="sessions" element={<FacultySessions />} />
            <Route path="reports" element={<FacultyReports />} />
            <Route path="exam-scores" element={<FacultyExams />} />
            <Route path="student-logs" element={<StudentLogs />} />
            <Route path="tasks" element={<FacultyTasks />} />
            <Route path="notifications" element={<FacultyNotifications />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Mentor System Built for MashMagic */}
          <Route path="/mentor" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/mentor/dashboard" replace />} />
            <Route path="dashboard" element={<MentorDashboard />} />
            <Route path="students" element={<MyStudents />} />
            <Route path="students/:id" element={<StudentDetails />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="student-log" element={<StudentInteractionLog />} />
            <Route path="faculty-log" element={<FacultyInteractionLog />} />
            <Route path="faculty-log/new" element={<FacultyInteractionLog />} />
            <Route path="exams" element={<Exams />} />
            <Route path="students-data" element={<StudentsData />} />
            <Route path="academic-schedule" element={<AcademicSchedule />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Student System */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>


          {/* Root Redirection Logic */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 text-center">
              <h1 className="text-9xl font-black text-slate-200">404</h1>
              <p className="text-xl font-bold text-slate-600 -mt-8 mb-8">Access Token Invalid or Page Missing</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all font-black uppercase tracking-widest text-[10px]"
              >
                Return to Safety
              </button>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
