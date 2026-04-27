const express = require('express');
const router = express.Router();
const {
    getAdminDashboardSummary,
    getUsers,
    getUserById,
    approveUser,
    blockUser,
    deleteUser,
    getAllStudentLogs,
    getAllFacultyLogs,
    getPendingUsers,
    rejectUser,
    getDailyMentorHeadReport,
    getAdminNotifications,
    markNotificationRead,
    deleteNotification,
    clearAllNotifications,
    getAllStudentsForAdmin,
    getAllMentorsForAdmin,
    getAllFacultiesForAdmin,
    getStaffMembers,
    getSubAdmins,
    createSubAdmin,
    updateSubAdmin,
    deleteSubAdmin,
    updateStudentForAdmin,
    updateUserForAdmin,
    getExamAnalytics,
    getMentorDistribution,
    getTaskAnalytics,
    getLiveMonitoring
} = require('../controllers/adminController');
const { getDailyHours } = require('../controllers/mentorController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Protect all routes - restrict to 'super_admin' or 'admin' 
// (assuming 'admin' is also allowed, user requirement said "requireRole('super_admin')")
// I will stick to 'super_admin' mostly but keep 'admin' if flexible. 
// User said "All admin routes must use: requireRole('super_admin')".
// The existing file had `requireRole('super_admin', 'admin')`. I will keep it.

router.use(requireAuth);
// General view access for admin and super_admin
router.get('/dashboard-summary', requireRole('super_admin'), getAdminDashboardSummary);
router.get('/pending-users', requireRole('super_admin'), getPendingUsers);
router.get('/users', requireRole('super_admin'), getUsers);
router.get('/students', requireRole('super_admin'), getAllStudentsForAdmin);
router.get('/mentors', requireRole('super_admin'), getAllMentorsForAdmin);
router.get('/faculties', requireRole('super_admin'), getAllFacultiesForAdmin);
router.get('/staff', requireRole('super_admin'), getStaffMembers);
router.get('/users/:id', requireRole('super_admin'), getUserById);
router.get('/student-logs', requireRole('super_admin'), getAllStudentLogs);
router.get('/faculty-logs', requireRole('super_admin'), getAllFacultyLogs);
router.get('/notifications', requireRole('super_admin'), getAdminNotifications);
router.get('/mentor-head-report', requireRole('super_admin'), getDailyMentorHeadReport);
router.get('/exam-analytics', requireRole('super_admin'), getExamAnalytics);
router.get('/mentor-distribution', requireRole('super_admin'), getMentorDistribution);
router.get('/task-analytics', requireRole('super_admin'), getTaskAnalytics);
router.get('/live-monitoring', requireRole('super_admin'), getLiveMonitoring);

// Management & Action routes (Unified Super Admin control)
router.use(requireRole('super_admin'));

router.put('/reject/:id', rejectUser);
router.put('/approve/:id', approveUser);
router.put('/block/:id', blockUser);
router.delete('/delete/:id', deleteUser);
router.put('/users/:id', updateUserForAdmin);
router.put('/students/:id', updateStudentForAdmin);

// Sub Admin management (allowed for Super Admin)
router.get('/sub-admins', requireRole('super_admin'), getSubAdmins);
router.post('/sub-admins', requireRole('super_admin'), createSubAdmin);
router.put('/sub-admins/:id', requireRole('super_admin'), updateSubAdmin);
router.delete('/sub-admins/:id', requireRole('super_admin'), deleteSubAdmin);

// Log Routes
router.get('/student-logs', getAllStudentLogs);
router.get('/faculty-logs', getAllFacultyLogs);
router.get('/daily-hours/:studentId', getDailyHours);

// Mentor Head Report
// router.get('/mentor-head-report', getDailyMentorHeadReport); // Handled above
// router.get('/exam-analytics', getExamAnalytics); // Handled above

// Notifications
router.get('/notifications', getAdminNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.delete('/notifications/clear-all', clearAllNotifications);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
