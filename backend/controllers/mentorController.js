const mongoose = require('mongoose');
const User = require('../models/userModel');
const Student = require('../models/Student');
const MentorSession = require('../models/MentorSession');
const Task = require('../models/Task');
const StudentInteractionLog = require('../models/StudentInteractionLog');
const FacultyInteractionLog = require('../models/FacultyInteractionLog');
const Session = require('../models/Session'); 
const StudentExam = require('../models/StudentExam');
const DailyHoursLog = require('../models/DailyHoursLog');
const MentorshipLog = require('../models/MentorshipLog');
const DailyUpdate = require('../models/DailyUpdate');

// @desc    Get mentor dashboard stats
// @route   GET /api/mentor/dashboard
const getMentorDashboard = async (req, res) => {
    try {
        const mentorId = req.user.id;

        // 1. Basic Counts
        const studentCount = await Student.countDocuments({ mentor_id: mentorId });
        const sessionCount = await MentorSession.countDocuments({ mentor_id: mentorId });
        const pendingTasks = await Task.countDocuments({ assigned_to: mentorId, status: { $ne: 'Completed' } });
        const completedTasks = await Task.countDocuments({ assigned_to: mentorId, status: 'Completed' });
        const studentLogsCount = await StudentInteractionLog.countDocuments({ mentor_id: mentorId });
        const facultyLogsCount = await FacultyInteractionLog.countDocuments({ mentor_id: mentorId });

        // 2. Audit Stats
        const completedSessionsCount = await MentorSession.countDocuments({ mentor_id: mentorId, status: 'Completed' });
        
        // 3. Recent Interactions (Combined Feed)
        const studentLogs = await StudentInteractionLog.find({ mentor_id: mentorId })
            .sort({ createdAt: -1 }).limit(5).populate('student_id', 'name');
        const facultyLogs = await FacultyInteractionLog.find({ mentor_id: mentorId })
            .sort({ createdAt: -1 }).limit(5).populate('student_id', 'name');

        const recentInteractions = [
            ...studentLogs.map(l => ({ date: l.date, student_name: l.student_id?.name, type: 'Student', remarks: l.mentor_notes })),
            ...facultyLogs.map(l => ({ date: l.date, student_name: l.student_id?.name, type: 'Faculty', remarks: l.notes }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        // 4. Session Schedules
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const liveSessions = await Session.find({
            date: { $gte: today, $lt: tomorrow },
            // Simplified "live" check for MongoDB migration demo
        }).populate('faculty_id', 'name').limit(5);

        const upcomingSessions = await Session.find({
            date: { $gte: today }
        }).sort({ date: 1, start_time: 1 }).limit(10).populate('faculty_id', 'name');

        const pastSessions = await Session.find({
            date: { $lt: today }
        }).sort({ date: -1, start_time: -1 }).limit(10).populate('faculty_id', 'name');

        res.status(200).json({
            success: true,
            data: {
                totalStudents: studentCount,
                totalSessions: sessionCount,
                pendingTasks,
                completedTasks,
                totalStudentInteractions: studentLogsCount,
                totalFacultyInteractions: facultyLogsCount,
                audit: {
                    completed_sessions: completedSessionsCount,
                    student_verified_sessions: studentLogsCount,
                    faculty_verified_sessions: facultyLogsCount
                },
                recentInteractions,
                liveSessions,
                upcomingSessions,
                pastSessions
            }
        });
    } catch (error) {
        console.error("FATAL DASHBOARD ERROR:", error);
        res.status(500).json({ success: false, message: "Internal Dashboard Error", error: error.message });
    }
};

// @desc    Get assigned students
// @route   GET /api/mentor/students
const getMentorStudents = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const students = await Student.find({ mentor_id: mentorId }).lean();
        
        // Enrich with session count and connection status
        const enrichedStudents = await Promise.all(students.map(async (s) => {
            const sessionCount = await MentorSession.countDocuments({ student_id: s._id, status: { $ne: 'Cancelled' } });
            
            const today = new Date();
            today.setHours(0,0,0,0);
            const connectedToday = await StudentInteractionLog.exists({
                student_id: s._id,
                date: { $gte: today },
                connected_today: true
            });

            return {
                ...s,
                id: s._id, // Compatibility for frontend expecting 'id'
                session_count: sessionCount,
                connected_today: !!connectedToday
            };
        }));

        res.status(200).json({ success: true, data: enrichedStudents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student details
// @route   GET /api/mentor/students/:id
const getStudentDetails = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const studentId = req.params.id;

        const student = await Student.findOne({ _id: studentId, mentor_id: mentorId });

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found or not assigned to you" });
        }

        const timetable = await MentorSession.find({ student_id: studentId }).sort({ date: 1, start_time: 1 });
        const studentLogs = await StudentInteractionLog.find({ student_id: studentId }).sort({ createdAt: -1 });
        const facultyLogs = await FacultyInteractionLog.find({ student_id: studentId }).sort({ createdAt: -1 });
        
        // Mocking or simplified for now
        const mentorshipLogs = []; 

        res.status(200).json({
            success: true,
            data: {
                ...student.toObject(),
                id: student._id,
                timetable,
                studentLogs,
                facultyLogs,
                mentorshipLogs
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get mentor tasks
// @route   GET /api/mentor/tasks
const getMentorTasks = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const tasks = await Task.find({ assigned_to: mentorId })
            .sort({ createdAt: -1 })
            .populate('assigned_by', 'name role');
        
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Complete mentor task
// @route   PUT /api/mentor/tasks/:id/complete
const processMentorTaskCompletion = async (req, res) => {
    try {
        const taskId = req.params.id;
        const mentorId = req.user.id;
        const task = await Task.findOneAndUpdate(
            { _id: taskId, assigned_to: mentorId },
            { status: 'Completed' },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        res.status(200).json({ success: true, message: "Task marked as completed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMentorTimetable = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { student_id, status, start_date, end_date } = req.query;

        let filter = {};
        if (req.user.role === 'mentor') filter.mentor_id = mentorId;
        if (student_id) filter.student_id = student_id;
        if (status) filter.status = status;
        if (start_date || end_date) {
            filter.date = {};
            if (start_date) filter.date.$gte = new Date(start_date);
            if (end_date) filter.date.$lte = new Date(end_date);
        }

        const sessions = await MentorSession.find(filter)
            .sort({ date: -1, start_time: -1 })
            .populate('student_id', 'name');

        const summary = {
            total: sessions.length,
            completed: sessions.filter(s => s.status === 'Completed').length,
            cancelled: sessions.filter(s => s.status === 'Cancelled').length,
            postponed: sessions.filter(s => s.status === 'Postponed').length,
            upcoming: sessions.filter(s => s.status === 'Scheduled').length,
            noShow: sessions.filter(s => s.status === 'No Show').length
        };

        res.status(200).json({ success: true, data: sessions, summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createSession = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { student_id, date, start_time, end_time, chapter, session_type, status, status_reason, notes } = req.body;

        // Auto-generate Session Number
        const lastSession = await MentorSession.findOne({ student_id }).sort({ session_number: -1 });
        const session_number = (lastSession?.session_number || 0) + 1;

        const newSession = new MentorSession({
            mentor_id: mentorId, student_id, session_number, date, start_time, end_time,
            chapter, session_type, status: status || 'Scheduled', status_reason, notes
        });
        await newSession.save();
        res.status(201).json({ success: true, message: "Session created", id: newSession._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateSession = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const sessionId = req.params.id;
        const updateData = req.body;

        await MentorSession.findOneAndUpdate({ _id: sessionId, mentor_id: mentorId }, updateData);
        res.status(200).json({ success: true, message: "Session updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteSession = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const sessionId = req.params.id;
        await MentorSession.findOneAndDelete({ _id: sessionId, mentor_id: mentorId });
        res.status(200).json({ success: true, message: "Session deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Removed complete/cancel/postpone legacy routes in favor of unified updateSession

// @desc    Create student interaction log
// @route   POST /api/mentor/student-log
// @desc    Create student interaction log
// @route   POST /api/mentor/student-log
const createStudentLog = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { student_id, date, connection_method, self_clarity, confidence, mentor_notes, connected_today } = req.body;

        const lastLog = await StudentInteractionLog.findOne({ student_id }).sort({ session_number: -1 });
        const nextSessionNumber = (lastLog?.session_number || 0) + 1;

        const newLog = new StudentInteractionLog({
            ...req.body,
            mentor_id: mentorId,
            session_number: nextSessionNumber
        });
        await newLog.save();

        res.status(201).json({ success: true, message: "Log saved", session_number: nextSessionNumber });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createFacultyLog = async (req, res) => {
    try {
        const mentorId = req.user.id;
        const { student_id } = req.body;

        const student = await Student.findById(student_id);
        const facultyId = student?.faculty_id;

        const lastLog = await FacultyInteractionLog.findOne({ student_id }).sort({ session_number: -1 });
        const nextSessionNumber = (lastLog?.session_number || 0) + 1;

        const newLog = new FacultyInteractionLog({
            ...req.body,
            mentor_id: mentorId,
            faculty_id: facultyId,
            session_number: nextSessionNumber
        });
        await newLog.save();

        res.status(201).json({ success: true, message: "Faculty log saved", session_number: nextSessionNumber });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getStudentLogs = async (req, res) => {
    try {
        const logs = await StudentInteractionLog.find({ mentor_id: req.user.id }).populate('student_id', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFacultyLogs = async (req, res) => {
    try {
        const logs = await FacultyInteractionLog.find({ mentor_id: req.user.id }).populate('student_id', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateFacultyLog = async (req, res) => {
    try {
        await FacultyInteractionLog.findOneAndUpdate({ _id: req.params.id, mentor_id: req.user.id }, req.body);
        res.status(200).json({ success: true, message: "Faculty log updated" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteFacultyLog = async (req, res) => {
    try {
        await FacultyInteractionLog.findOneAndDelete({ _id: req.params.id, mentor_id: req.user.id });
        res.status(200).json({ success: true, message: "Faculty log deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const toggleStudentConnection = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { connected_today } = req.body;
        const today = new Date();
        today.setHours(0,0,0,0);

        if (connected_today) {
            await StudentInteractionLog.findOneAndUpdate(
                { mentor_id: req.user.id, student_id: studentId, date: { $gte: today } },
                { connected_today: true, mentor_notes: 'Quick connection marked' },
                { upsert: true }
            );
        } else {
            await StudentInteractionLog.findOneAndUpdate(
                { mentor_id: req.user.id, student_id: studentId, date: { $gte: today } },
                { connected_today: false }
            );
        }
        res.status(200).json({ success: true, message: 'Status updated' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const completeOnboarding = async (req, res) => {
    try {
        await Student.findOneAndUpdate({ _id: req.params.id, mentor_id: req.user.id }, { onboarding_status: 'completed' });
        res.status(200).json({ success: true, message: "Onboarding completed" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createBatchTimetable = async (req, res) => {
    try {
        const { student_id, sessions } = req.body;
        const lastSession = await MentorSession.findOne({ student_id }).sort({ session_number: -1 });
        let currentNum = (lastSession?.session_number || 0) + 1;

        const sessionDocs = sessions.map(s => ({
            ...s,
            mentor_id: req.user.id,
            student_id,
            session_number: currentNum++
        }));

        await MentorSession.insertMany(sessionDocs);
        await Student.findByIdAndUpdate(student_id, { onboarding_status: 'completed' });
        res.status(201).json({ success: true, message: "Batch timetable created" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getPendingExams = async (req, res) => {
    try {
        const students = await Student.find({ mentor_id: req.user.id, status: 'active' });
        let pending = [];
        for (const s of students) {
            const count = await MentorSession.countDocuments({ student_id: s._id, status: { $ne: 'Cancelled' } });
            for (let m = 5; m <= count; m += 5) {
                const exam = await StudentExam.findOne({ student_id: s._id, milestone_session: m });
                if (!exam || exam.status !== 'Completed') {
                    pending.push({ student_id: s._id, student_name: s.name, milestone: m, status: exam?.status || 'Pending' });
                }
            }
        }
        res.status(200).json({ success: true, data: pending });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getExamHistory = async (req, res) => {
    try {
        const history = await StudentExam.find({ mentor_id: req.user.id }).populate('student_id', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: history });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const submitExamResult = async (req, res) => {
    try {
        const { student_id, milestone, score, type, postponed_date, reason } = req.body;
        if (type === 'Complete') {
            await StudentExam.findOneAndUpdate({ student_id, milestone_session: milestone }, { mentor_id: req.user.id, score, status: 'Completed' }, { upsert: true });
        } else {
            await StudentExam.findOneAndUpdate({ student_id, milestone_session: milestone }, { mentor_id: req.user.id, status: 'Postponed', postponed_date, reason }, { upsert: true });
        }
        res.status(200).json({ success: true, message: "Result submitted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const logDailyHours = async (req, res) => {
    try {
        const { student_id, hours, date } = req.body;
        await DailyHoursLog.findOneAndUpdate({ student_id, date: new Date(date) }, { mentor_id: req.user.id, hours }, { upsert: true });
        res.status(200).json({ success: true, message: "Hours logged" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getDailyHours = async (req, res) => {
    try {
        const logs = await DailyHoursLog.find({ student_id: req.params.studentId }).sort({ date: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAcademicSchedule = async (req, res) => {
    try {
        const students = await Student.find({ mentor_id: req.user.id });
        const studentIds = students.map(s => s._id);
        const schedule = await Session.find({ student_ids: { $in: studentIds } }).populate('faculty_id student_ids', 'name').sort({ date: -1 });
        res.status(200).json({ success: true, data: schedule });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getStudentDailyUpdates = async (req, res) => {
    try {
        const updates = await DailyUpdate.find({ student_id: req.params.studentId, mentor_id: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: updates });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createMentorshipLog = async (req, res) => {
    try {
        const log = new MentorshipLog({ ...req.body, mentor_id: req.user.id });
        await log.save();
        res.status(201).json({ success: true, message: "Mentorship log saved" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMentorshipLogs = async (req, res) => {
    try {
        const logs = await MentorshipLog.find({ student_id: req.params.studentId }).sort({ session_date: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
    getMentorDashboard,
    getMentorStudents,
    getStudentDetails,
    getMentorTasks,
    completeMentorTask: processMentorTaskCompletion,
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
    getAcademicSchedule,
    completeOnboarding,
    createBatchTimetable,
    getPendingExams,
    getExamHistory,
    submitExamResult,
    logDailyHours,
    getDailyHours,
    getStudentDailyUpdates,
    createMentorshipLog,
    getMentorshipLogs
};
