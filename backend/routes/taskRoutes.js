const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTaskStatus, deleteTask } = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// All task routes require authentication
router.use(requireAuth);

// Admin and Mentor Head routes for creating/deleting
router.get('/', getTasks);
router.post('/', requireRole('super_admin', 'admin', 'academic_head', 'mentor_head'), createTask);
router.delete('/:id', requireRole('super_admin', 'admin', 'academic_head', 'mentor_head'), deleteTask);

// Status update can be done by mentor or admin
router.put('/:id/status', updateTaskStatus);

module.exports = router;
