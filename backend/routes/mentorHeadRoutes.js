const express = require('express');
const router = express.Router();
const {
    registerMentor,
    getDashboardStats,
    getMentorStudents,
    getAllActivities,
    getMentorDetails,
    getMentorActivityDashboard,
    getMentorMonitoringDetails,
    shiftStudent,
    getDailyStudentChecks,
    checkStudentToday,
    uncheckStudent,
    getDailySummary,
    getAllStudents,
    getMentorInteractionLogs,
    getFacultyIntelligenceLogs,
    getExamAnalytics,
    editStudent,
    deleteStudent,
    getFaculties,
    editFaculty,
    deleteFaculty,
    getMentors,
    getStudents,
    editMentor,
    deleteMentor,
    toggleCourseCompleted
} = require('../controllers/mentorHeadController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All routes require mentor_head role
router.use(requireAuth);
router.use(requireRole('mentor_head'));

router.post('/register-mentor', registerMentor);
router.get('/dashboard', getDashboardStats);
router.get('/activities', getAllActivities);
router.get('/mentor/:mentorId/students', getMentorStudents);
router.get('/mentor/:mentorId/details', getMentorDetails);

// Monitoring Architecture Routes
router.get('/mentor-activity', getMentorActivityDashboard);
router.get('/mentors/:mentorId/monitoring', getMentorMonitoringDetails);
router.put('/students/:studentId/shift', shiftStudent);
router.get('/daily-student-checks', getDailyStudentChecks);
router.post('/students/:studentId/check', checkStudentToday);
router.delete('/students/:studentId/uncheck', uncheckStudent);
router.get('/daily-summary', getDailySummary);
router.get('/all-students', getAllStudents);
router.get('/exam-analytics', getExamAnalytics);

// Student Management for Mentor Head (Unified)
router.get('/students-all', getStudents);
router.put('/students/:id', editStudent);
router.delete('/students/:id', deleteStudent);
router.put('/students/:studentId/course-complete', toggleCourseCompleted);

// Intelligence Hub Routes
router.get('/mentor-logs', getMentorInteractionLogs);
router.get('/faculty-intelligence', getFacultyIntelligenceLogs);

// Faculty Management for Mentor Head
router.get('/faculties-all', getFaculties);
router.put('/faculties/:id', editFaculty);
router.delete('/faculties/:id', deleteFaculty);

// Student Management for Mentor Head (Unified)
router.get('/students-all', getStudents);
router.put('/students/:id', editStudent);
router.delete('/students/:id', deleteStudent);

// Mentor Management for Mentor Head (Unified)
router.get('/mentors-all', getMentors);
router.put('/mentors/:mentorId', editMentor);
router.delete('/mentors/:mentorId', deleteMentor);

module.exports = router;
