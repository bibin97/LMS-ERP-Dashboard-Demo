const Task = require('../models/Task');
const User = require('../models/userModel');

// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        let filter = {};

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59Z');
        }

        if (category === 'Active Records') {
            filter.status = { $nin: ['Completed', 'Success', 'Rejected'] };
        } else if (category === 'Archived Records') {
            filter.status = { $in: ['Completed', 'Success', 'Rejected'] };
        }

        // Role-based filtering
        if (req.user.role === 'academic_head') {
            filter.assigned_by = req.user.id;
        } else if (req.user.role === 'mentor' || req.user.role === 'faculty') {
            filter.assigned_to = req.user.id;
        } else if (req.user.role === 'mentor_head') {
            // Complex logic for mentor head
            filter.$or = [
                { assigned_by: req.user.id },
                { assigned_to: req.user.id }
            ];
            // Also include tasks assigned to mentors
            const mentors = await User.find({ role: 'mentor' }).select('_id');
            const mentorIds = mentors.map(m => m._id);
            filter.$or.push({ assigned_to: { $in: mentorIds } });
        } else if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        const tasks = await Task.find(filter)
            .populate('assigned_to', 'name email role')
            .populate('assigned_by', 'name role')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new task
const createTask = async (req, res) => {
    try {
        const { title, description, mentor_id, deadline, priority } = req.body;
        const newTask = new Task({
            title, description, 
            assigned_to: mentor_id, 
            assigned_by: req.user.id, 
            deadline, priority
        });
        await newTask.save();
        res.status(201).json({ success: true, message: "Task created", taskId: newTask._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update task status
const updateTaskStatus = async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.status(200).json({ success: true, message: "Task status updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete task
const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTaskStatus,
    deleteTask
};
