const mongoose = require('mongoose');
const User = require('../models/userModel');
const Student = require('../models/Student');
const AdminNotification = require('../models/AdminNotification');
const StudentInteractionLog = require('../models/StudentInteractionLog');
const FacultyInteractionLog = require('../models/FacultyInteractionLog');
const StudentVerification = require('../models/StudentVerification');
const DailyHoursLog = require('../models/DailyHoursLog');
const StudentMark = require('../models/StudentMark');
const StudentExam = require('../models/StudentExam');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Report = require('../models/Report');
const Task = require('../models/Task');
const FacultyDocument = require('../models/FacultyDocument');
const MentorshipLog = require('../models/MentorshipLog');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcrypt');

const getAdminDashboardSummary = async (req, res) => {
    try {
        const students = await Student.countDocuments();
        const mentors = await User.countDocuments({ role: 'mentor' });
        const faculties = await User.countDocuments({ role: 'faculty' });
        const pending = await User.countDocuments({ 
            $or: [{ status: 'pending' }, { isApproved: false }],
            status: { $ne: 'rejected' }
        });
        res.status(200).json({ success: true, data: { students, mentors, faculties, pendingApprovals: pending } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('name email role status');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email role status');
        res.status(200).json({ success: true, data: user });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const approveUser = async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;
        let name;
        if (role === 'student') {
            const student = await Student.findByIdAndUpdate(id, { status: 'active', isApproved: true });
            name = student?.name;
        } else {
            const user = await User.findByIdAndUpdate(id, { status: 'active', isApproved: true, isActive: true });
            name = user?.name;
        }
        await AdminNotification.create({ message: `<b>Approval Success:</b> ${name || id} is now <span style="color:#008080">Active</span>.` });
        res.status(200).json({ success: true, message: "Approved successfully" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const blockUser = async (req, res) => {
    try {
        const role = req.body.role || req.query.role;
        const { id } = req.params;
        let name;
        if (role === 'student') {
            const student = await Student.findByIdAndUpdate(id, { status: 'inactive' });
            name = student?.name;
        } else {
            const user = await User.findByIdAndUpdate(id, { status: 'inactive' });
            name = user?.name;
        }
        await AdminNotification.create({ message: `<b>Security Alert:</b> ${role} <b>${name || id}</b> has been <span style="color:#e11d48">Blocked</span> by Admin.` });
        res.status(200).json({ success: true, message: "Blocked successfully" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ $or: [{ status: 'pending' }, { isApproved: false }], status: { $ne: 'rejected' } }).populate('registeredBy', 'name');
        const students = await Student.find({ $or: [{ status: 'pending' }, { isApproved: false }], status: { $ne: 'rejected' } }).populate('registeredBy', 'name');
        const combined = [...users.map(u => ({...u.toObject(), type: 'user'})), ...students.map(s => ({...s.toObject(), type: 'student', email: 'N/A', role: 'student'}))];
        res.status(200).json({ success: true, count: combined.length, data: combined });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const rejectUser = async (req, res) => {
    try {
        const { role } = req.body;
        if (role === 'student') await Student.findByIdAndUpdate(req.params.id, { status: 'rejected', isApproved: false });
        else await User.findByIdAndUpdate(req.params.id, { status: 'rejected', isApproved: false, isActive: false });
        res.status(200).json({ success: true, message: "Rejected" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const role = req.query?.role || req.body?.role;
    try {
        if (role === 'student') {
            await StudentInteractionLog.deleteMany({ student_id: id });
            await FacultyInteractionLog.deleteMany({ student_id: id });
            await StudentVerification.deleteMany({ student_id: id });
            await DailyHoursLog.deleteMany({ student_id: id });
            await StudentMark.deleteMany({ student_id: id });
            await StudentExam.deleteMany({ student_id: id });
            await Attendance.deleteMany({ student_id: id });
            await Report.deleteMany({ student_id: id });
            await MentorSession.deleteMany({ student_id: id });
            await Student.findByIdAndDelete(id);
        } else {
            const user = await User.findById(id);
            if (user?.role === 'super_admin' && user?.status === 'active') return res.status(403).json({ success: false, message: "Cannot delete active Super Admin" });
            await User.updateMany({ registeredBy: id }, { registeredBy: null });
            await Student.updateMany({ registeredBy: id }, { registeredBy: null });
            await Task.deleteMany({ $or: [{ assigned_by: id }, { assigned_to: id }] });
            await User.findByIdAndDelete(id);
        }
        res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAllStudentLogs = async (req, res) => {
    try {
        const logs = await StudentInteractionLog.find().populate('mentor_id student_id', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAllFacultyLogs = async (req, res) => {
    try {
        const logs = await FacultyInteractionLog.find().populate('mentor_id student_id', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getDailyMentorHeadReport = async (req, res) => {
    try {
        const mentorHeads = await User.find({ role: 'mentor_head' });
        const total = await Student.countDocuments({ status: 'active' });
        const data = await Promise.all(mentorHeads.map(async (mh) => {
            const checked = await StudentVerification.countDocuments({ mentor_head_id: mh._id, date: { $gte: new Date().setHours(0,0,0,0) } });
            return { mentorHeadName: mh.name, totalStudents: total, checkedToday: checked, remaining: total - checked };
        }));
        res.status(200).json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAdminNotifications = async (req, res) => {
    try {
        const notifications = await AdminNotification.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, data: notifications });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const markNotificationRead = async (req, res) => {
    try {
        await AdminNotification.findByIdAndUpdate(req.params.id, { is_read: true });
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteNotification = async (req, res) => {
    try {
        await AdminNotification.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const clearAllNotifications = async (req, res) => {
    try {
        await AdminNotification.deleteMany();
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateStudentForAdmin = async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Updated" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateUserForAdmin = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Updated" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAllStudentsForAdmin = async (req, res) => {
    try {
        const students = await Student.find().populate('mentor_id faculty_id', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getSubAdmins = async (req, res) => {
    try {
        const subs = await User.find({ role: 'sub_admin' });
        res.status(200).json({ success: true, data: subs });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createSubAdmin = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const sub = new User({ ...req.body, password: hashedPassword, role: 'sub_admin' });
        await sub.save();
        res.status(201).json({ success: true, id: sub._id });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateSubAdmin = async (req, res) => {
    try {
        const update = { ...req.body };
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            update.password = await bcrypt.hash(req.body.password, salt);
        }
        await User.findByIdAndUpdate(req.params.id, update);
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteSubAdmin = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};


const getAllMentorsForAdmin = async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' }).lean();
        const data = await Promise.all(mentors.map(async (m) => {
            const studentCount = await Student.countDocuments({ mentor_id: m._id, status: 'active' });
            return { ...m, studentCount };
        }));
        res.status(200).json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getStaffMembers = async (req, res) => {
    try {
        const staff = await User.find({ role: { $in: ['mentor', 'faculty', 'academic_head', 'mentor_head'] } });
        res.status(200).json({ success: true, data: staff });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAllFacultiesForAdmin = async (req, res) => {
    try {
        const faculties = await User.find({ role: 'faculty' })
            .select('-password')
            .lean();
        const data = await Promise.all(faculties.map(async (f) => {
            const studentsUnder = await Student.countDocuments({ faculty_id: f._id, status: 'active' });
            const assignedStudents = await Student.find({ faculty_id: f._id, status: 'active' }).select('name grade subject').lean();
            return { ...f, studentsUnder, assignedStudents };
        }));
        res.status(200).json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Admin updates faculty_id and hourly_rate
const updateFacultyById = async (req, res) => {
    try {
        const { faculty_id, hourly_rate } = req.body;
        const updates = {};
        if (faculty_id !== undefined) updates.faculty_id = faculty_id;
        if (hourly_rate !== undefined) updates.hourly_rate = Number(hourly_rate);
        const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
        if (!updated) return res.status(404).json({ success: false, message: 'Faculty not found' });
        res.status(200).json({ success: true, message: 'Faculty updated', data: updated });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getExamAnalytics = async (req, res) => {
    try {
        const data = await StudentMark.aggregate([
            { $group: { _id: { subject: "$subject", term: "$term" }, avg_marks: { $avg: "$marks" }, avg_total: { $avg: "$total" } } }
        ]);
        res.status(200).json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMentorDistribution = async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' }).lean();
        const data = await Promise.all(mentors.map(async (m) => {
            const count = await Student.countDocuments({ mentor_id: m._id, status: 'active' });
            return { mentor_name: m.name, student_count: count };
        }));
        res.status(200).json({ success: true, data: data.filter(d => d.student_count > 0) });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getTaskAnalytics = async (req, res) => {
    try {
        const total = await Task.countDocuments();
        const completed = await Task.countDocuments({ status: 'Completed' });
        res.status(200).json({ success: true, data: { total, completed, pending: total - completed } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLiveMonitoring = async (req, res) => {
    try {
        const logs = await ActivityLog.find().populate('user_id student_id', 'name').sort({ createdAt: -1 }).limit(10);
        res.status(200).json({ success: true, data: logs });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
    getAdminDashboardSummary, getUsers, getUserById, approveUser, blockUser,
    getPendingUsers, rejectUser, deleteUser, getAllStudentLogs, getAllFacultyLogs,
    getDailyMentorHeadReport, getAdminNotifications, markNotificationRead,
    deleteNotification, clearAllNotifications, updateStudentForAdmin,
    updateUserForAdmin, getAllStudentsForAdmin, getSubAdmins, createSubAdmin,
    updateSubAdmin, deleteSubAdmin,
    getAllMentorsForAdmin, getStaffMembers, getAllFacultiesForAdmin, updateFacultyById,
    getExamAnalytics, getMentorDistribution, getTaskAnalytics, getLiveMonitoring
};
