const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Report = require('../models/Report');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc    Faculty dashboard
const getDashboard = async (req, res) => {
    try {
        const facultyId = req.user.id;
        const totalStudents = await Student.countDocuments({ faculty_id: facultyId });
        const pendingReports = await Report.countDocuments({ faculty_id: facultyId, status: 'Open' });
        const today = new Date(); today.setHours(0,0,0,0);
        const endOfDay = new Date(today); endOfDay.setHours(23,59,59,999);
        const upcomingSessions = await Session.countDocuments({ faculty_id: facultyId, date: { $gte: today, $lte: endOfDay }, status: 'Scheduled' });
        const completedSessions = await Session.countDocuments({ faculty_id: facultyId, status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ assigned_to: facultyId, status: 'Pending' });

        const performanceData = await Student.aggregate([
            { $match: { faculty_id: facultyId } },
            { $group: { _id: '$performance_status', count: { $sum: 1 } } },
            { $project: { status: '$_id', count: 1, _id: 0 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                badges: { totalStudents, pendingReports, upcomingSessions, completedSessions, pendingTasks },
                charts: { performance: performanceData, attendance: [] }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get assigned students
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({ faculty_id: req.user.id }).select('name roll_number attendance_percentage performance_status status createdAt badge');
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student profile
const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ _id: req.params.id, faculty_id: req.user.id });
        if (!student) return res.status(403).json({ success: false, message: 'Student not assigned to you' });
        const attendance = await Attendance.find({ student_id: student._id }).populate('session_id');
        const reports = await Report.find({ student_id: student._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: { profile: student, marks: [], attendance, reports } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create session
const createSession = async (req, res) => {
    try {
        const { topic, date, studentIds } = req.body;
        const session = new Session({ faculty_id: req.user.id, topic, date, student_ids: studentIds || [], status: 'Scheduled' });
        await session.save();
        res.status(201).json({ success: true, message: 'Session created', id: session._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get sessions
const getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ faculty_id: req.user.id }).sort({ date: -1 });
        const enriched = await Promise.all(sessions.map(async s => ({
            ...s.toObject(),
            student_count: s.student_ids?.length || 0
        })));
        res.status(200).json({ success: true, data: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get session students
const getSessionStudents = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id).populate('student_ids', 'name roll_number');
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        res.status(200).json({ success: true, data: session.student_ids });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Complete session
const completeSession = async (req, res) => {
    try {
        const { attendance } = req.body;
        await Session.findByIdAndUpdate(req.params.id, { status: 'Completed' });
        if (attendance?.length > 0) {
            const ops = attendance.map(r => ({
                updateOne: {
                    filter: { session_id: req.params.id, student_id: r.student_id },
                    update: { status: r.status, marked_by: req.user.id },
                    upsert: true
                }
            }));
            await Attendance.bulkWrite(ops);
        }
        res.status(200).json({ success: true, message: 'Session completed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit interaction report
const submitReport = async (req, res) => {
    try {
        const { student_id, type, remarks, action_taken, status, follow_up_date } = req.body;
        await Report.create({ faculty_id: req.user.id, student_id, type, remarks, action_taken, status: status || 'Open', follow_up_date });
        res.status(201).json({ success: true, message: 'Report submitted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get reports
const getReports = async (req, res) => {
    try {
        const reports = await Report.find({ faculty_id: req.user.id }).sort({ createdAt: -1 }).populate('student_id', 'name');
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get tasks
const getFacultyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assigned_to: req.user.id }).sort({ deadline: 1 }).populate('assigned_by', 'name');
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit task proof
const submitTaskProof = async (req, res) => {
    try {
        const proof_url = req.file ? req.file.path : null;
        await Task.findOneAndUpdate({ _id: req.params.id, assigned_to: req.user.id }, { status: 'Completed', proof_url });
        res.status(200).json({ success: true, message: 'Task completed with proof' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get notifications
const getNotifications = async (req, res) => {
    try {
        const notifs = await Notification.find({ user_id: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark notification read
const markRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate({ _id: req.params.id, user_id: req.user.id }, { is_read: true });
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update profile
const updateProfile = async (req, res) => {
    try {
        const updates = {};
        if (req.body.phone_number) updates.phone_number = req.body.phone_number;
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(req.body.password, salt);
        }
        if (req.file) updates.profile_image = req.file.path;
        if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: 'No updates provided' });
        await User.findByIdAndUpdate(req.user.id, updates);
        res.status(200).json({ success: true, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get mentor logs for faculty students
const getMentorLogs = async (req, res) => {
    try {
        const students = await Student.find({ faculty_id: req.user.id }).select('_id');
        res.status(200).json({ success: true, data: [] }); // Requires MentorLog model
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student exam scores
const getStudentExamScores = async (req, res) => {
    try {
        res.status(200).json({ success: true, data: [] }); // Requires StudentExam query by faculty
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit exam score
const submitExamScore = async (req, res) => {
    try {
        res.status(201).json({ success: true, message: 'Score noted (use StudentExam model)' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboard, getStudents, getStudentProfile,
    createSession, getSessions, getSessionStudents, completeSession,
    submitReport, getReports, getFacultyTasks, submitTaskProof,
    getNotifications, markRead, updateProfile,
    getMentorLogs, getStudentExamScores, submitExamScore
};
