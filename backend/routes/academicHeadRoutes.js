const express = require('express');
const router = express.Router();
const {
    getDropdownData,
    registerStudent,
    registerFaculty,
    getDashboardStats,
    getAllFacultyActivity,
    getStudentInteractionLogs,
    getFacultyInteractionLogs,
    getAcademicActions,
    getDailyFacultyChecks,
    checkFacultySessionToday,
    uncheckFacultySession,
    getFacultyDirectory,
    getAcademicDocuments,
    uploadAcademicDocument,
    deleteAcademicDocument,
    getLiveClassEvaluations,
    submitLiveClassEvaluation,
    getPendingFacultyLogs,
    verifyFacultyLog,
    getExamAnalytics,
    editFaculty,
    deleteFaculty,
    editStudent,
    deleteStudent,
    getStudents,
    getMentors,
    editMentor,
    deleteMentor,
    saveExamPlan,
    getLiveMonitoring
} = require('../controllers/academicHeadController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All routes require academic_head role
router.use(requireAuth);
router.use(requireRole('academic_head'));

router.get('/dashboard', getDashboardStats);
router.get('/exam-analytics', getExamAnalytics);
router.get('/actions', getAcademicActions);
router.get('/faculties', getFacultyDirectory);
router.get('/documents', getAcademicDocuments);
router.post('/documents', uploadAcademicDocument);
router.delete('/documents/:id', deleteAcademicDocument);
router.get('/faculty-activity-logs', getAllFacultyActivity);
router.get('/student-interaction-logs', getStudentInteractionLogs);
router.get('/faculty-interaction-logs', getFacultyInteractionLogs);
router.get('/faculty-checks', getDailyFacultyChecks);
router.post('/sessions/:sessionId/check', checkFacultySessionToday);
router.delete('/sessions/:sessionId/uncheck', uncheckFacultySession);
router.get('/dropdowns', getDropdownData);
router.post('/register-student', registerStudent);
router.post('/register-faculty', registerFaculty);

// Checking Section
router.get('/live-class-evaluations', getLiveClassEvaluations);
router.post('/live-class-evaluations', submitLiveClassEvaluation);
router.post('/exams/plan', saveExamPlan);
router.get('/faculty-logs-pending', getPendingFacultyLogs);
router.put('/faculty-logs/:id/verify', verifyFacultyLog);

// New Management Routes
router.put('/faculties/:id', editFaculty);
router.delete('/faculties/:id', deleteFaculty);
router.put('/students/:id', editStudent);
router.delete('/students/:id', deleteStudent);

// Management Lists
router.get('/students-all', getStudents);
router.get('/students', getStudents);
router.get('/mentors-all', getMentors);
router.get('/live-monitoring', getLiveMonitoring);
router.put('/mentors/:id', editMentor);
router.delete('/mentors/:id', deleteMentor);

module.exports = router;
