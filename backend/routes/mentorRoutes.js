const express = require('express');
const router = express.Router();
const {
    getMentorDashboard,
    getMentorStudents,
    getStudentDetails,
    getMentorTasks,
    completeMentorTask,
    getMentorTimetable,
    createSession,
    updateSession,
    deleteSession,
    createStudentLog,
    createFacultyLog,
    updateFacultyLog,
    deleteFacultyLog,
    getStudentLogs,
    getFacultyLogs,
    toggleStudentConnection,
    completeOnboarding,
    createBatchTimetable,
    getPendingExams,
    getExamHistory,
    submitExamResult,
     logDailyHours,
     getDailyHours,
     getAcademicSchedule,
     getStudentDailyUpdates,
     createMentorshipLog,
     getMentorshipLogs
 } = require('../controllers/mentorController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Apply middleware to all routes
router.use(requireAuth);
router.use(requireRole('mentor'));

router.get('/dashboard', getMentorDashboard);
router.get('/students', getMentorStudents);
router.get('/students/:id', getStudentDetails);
router.get('/tasks', getMentorTasks);
router.put('/tasks/:id/complete', completeMentorTask);
router.get('/timetable', getMentorTimetable);
router.post('/timetable', createSession);
router.put('/timetable/:id', updateSession);
router.delete('/timetable/:id', deleteSession);
router.post('/student-log', createStudentLog);
router.post('/faculty-log', createFacultyLog);
// New log retrieval routes
router.get('/student-logs', getStudentLogs);
router.get('/faculty-logs', getFacultyLogs);
router.put('/faculty-log/:id', updateFacultyLog);
router.delete('/faculty-log/:id', deleteFacultyLog);

// Daily Hours
router.post('/daily-hours', logDailyHours);
router.get('/daily-hours/:studentId', getDailyHours);

// Monitoring
router.get('/students/:studentId/daily-updates', getStudentDailyUpdates);
router.put('/students/:studentId/connection', toggleStudentConnection);
router.put('/students/:studentId/onboard', completeOnboarding);
router.post('/timetable/batch', createBatchTimetable);

// Exams
router.get('/exams/pending', getPendingExams);
router.get('/exams/history', getExamHistory);
router.get('/academic-schedule', getAcademicSchedule);
router.post('/exams/submit', submitExamResult);

// Mentorship Logs
router.post('/mentorship-log', createMentorshipLog);
router.get('/mentorship-logs/:studentId', getMentorshipLogs);

module.exports = router;
