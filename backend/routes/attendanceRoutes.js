const express = require('express');
const router = express.Router();
const { markAttendance, getSessionAttendance, getMyAttendanceStats } = require('../controllers/attendanceController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.post('/mark', markAttendance);
router.get('/session/:id', getSessionAttendance);
router.get('/my-stats', getMyAttendanceStats);

module.exports = router;
