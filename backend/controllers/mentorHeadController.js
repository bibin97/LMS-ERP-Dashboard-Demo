const User = require('../models/userModel');
const Student = require('../models/Student');
const StudentInteractionLog = require('../models/StudentInteractionLog');
const FacultyInteractionLog = require('../models/FacultyInteractionLog');
const AdminNotification = require('../models/AdminNotification');
const StudentVerification = require('../models/StudentVerification');
const MentorSession = require('../models/MentorSession');
const DailyHoursLog = require('../models/DailyHoursLog');
const Task = require('../models/Task');
const DailyUpdate = require('../models/DailyUpdate');
const bcrypt = require('bcrypt');

// @desc    Register a new mentor
exports.registerMentor = async (req, res) => {
    try {
        const { name, email, phone_number, place, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phone_number }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Mentor already registered with this email or phone" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newMentor = await User.create({
            name, email, phone_number, place,
            password: hashedPassword,
            role: 'mentor',
            status: 'pending',
            isApproved: false,
            registeredBy: req.user.id
        });

        const msg = `<b>${req.user.name}</b> (Mentor Head) added <b>${name}</b> (Mentor)`;
        await AdminNotification.create({ message: msg });

        res.status(201).json({ success: true, message: "Mentor registered. Pending Admin approval.", mentorId: newMentor._id });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Update mentor
exports.editMentor = async (req, res) => {
    try {
        const { name, email, phone_number, place, password } = req.body;
        let updateData = { name, email, phone_number, place };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await User.findByIdAndUpdate(req.params.mentorId, updateData);
        await AdminNotification.create({ message: `Mentor Head (${req.user.name}) updated mentor details for ${name}` });
        res.status(200).json({ success: true, message: "Mentor updated" });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' }).lean();
        const data = await Promise.all(mentors.map(async (m) => {
            const count = await StudentInteractionLog.countDocuments({ mentor_id: m._id });
            return {
                mentor_id: m._id,
                mentor_name: m.name,
                phone_number: m.phone_number,
                place: m.place,
                completed_count: count
            };
        }));
        res.status(200).json({ success: true, data: data.sort((a,b) => b.completed_count - a.completed_count) });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Get mentor interaction logs
exports.getMentorInteractionLogs = async (req, res) => {
    try {
        const studentLogs = await StudentInteractionLog.find().populate('student_id mentor_id', 'name').sort({ createdAt: -1 });
        const facultyLogs = await FacultyInteractionLog.find().populate('student_id mentor_id', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: { studentLogs, facultyLogs } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Shift student
exports.shiftStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { newMentorId } = req.body;

        const student = await Student.findById(studentId);
        const oldMentorName = student?.mentor_name || 'Unknown';
        
        const newMentor = await User.findById(newMentorId);
        if (!newMentor) return res.status(404).json({ success: false, message: "Mentor not found" });

        await Student.findByIdAndUpdate(studentId, {
            mentor_id: newMentorId,
            mentor_name: newMentor.name,
            faculty_id: null,
            faculty_name: 'Not Assigned',
            is_shifted: true,
            shifted_from: oldMentorName
        });

        // Transfer history
        await StudentInteractionLog.updateMany({ student_id: studentId }, { mentor_id: newMentorId });
        await FacultyInteractionLog.updateMany({ student_id: studentId }, { mentor_id: newMentorId });
        await MentorSession.updateMany({ student_id: studentId }, { mentor_id: newMentorId });
        await DailyHoursLog.updateMany({ student_id: studentId }, { mentor_id: newMentorId });

        await AdminNotification.create({ message: `Student shifted from ${oldMentorName} to ${newMentor.name}` });
        res.status(200).json({ success: true, message: 'Student and history shifted' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// Simplified placeholders for other functions to keep code concise but functional
exports.getMentorStudents = async (req, res) => {
    try {
        const logs = await StudentInteractionLog.find({ mentor_id: req.params.mentorId }).populate('student_id', 'name').sort({ date: -1 });
        res.status(200).json({ success: true, data: logs });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getAllActivities = async (req, res) => {
    try {
        const slogs = await StudentInteractionLog.find().populate('student_id mentor_id', 'name').limit(25).lean();
        const flogs = await FacultyInteractionLog.find().populate('student_id mentor_id', 'name').limit(25).lean();
        const activities = [...slogs.map(l => ({...l, type: 'Mentor Interaction'})), ...flogs.map(l => ({...l, type: 'Faculty Interaction'}))];
        res.status(200).json({ success: true, data: activities.sort((a,b) => b.createdAt - a.createdAt) });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getMentorDetails = async (req, res) => {
    try {
        const id = req.params.mentorId;
        const profile = await User.findById(id).select('name phone_number place status createdAt');
        const students = await Student.find({ mentor_id: id });
        const slogs = await StudentInteractionLog.find({ mentor_id: id }).populate('student_id', 'name');
        const flogs = await FacultyInteractionLog.find({ mentor_id: id }).populate('student_id', 'name');
        res.status(200).json({ success: true, data: { profile, assignedStudents: students, logs: slogs, facultyLogs: flogs } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getMentorActivityDashboard = async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' }).lean();
        const data = await Promise.all(mentors.map(async (m) => {
            const students = await Student.find({ mentor_id: m._id });
            return {
                mentor_id: m._id,
                mentor_name: m.name,
                total_assigned_students: students.length,
                students_list: students
            };
        }));
        res.status(200).json({ success: true, data });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getMentorMonitoringDetails = async (req, res) => {
    try {
        const id = req.params.mentorId;
        const profile = await User.findById(id);
        const students = await Student.find({ mentor_id: id }).lean();
        res.status(200).json({ success: true, data: { profile, assignedStudents: students } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select('name course grade mentor_id onboarding_status');
        res.status(200).json({ success: true, data: students });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getDailyStudentChecks = async (req, res) => {
    try {
        const students = await Student.find().populate('mentor_id', 'name').lean();
        res.status(200).json({ success: true, data: students });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.checkStudentToday = async (req, res) => {
    try {
        await StudentVerification.create({ student_id: req.params.studentId, mentor_head_id: req.user.id });
        res.status(200).json({ success: true, message: 'Check added' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.uncheckStudent = async (req, res) => {
    try {
        await StudentVerification.findOneAndDelete({ student_id: req.params.studentId }, { sort: { createdAt: -1 } });
        res.status(200).json({ success: true, message: 'Last check removed' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getDailySummary = async (req, res) => {
    try {
        const total = await Student.countDocuments();
        const checked = await StudentVerification.countDocuments({ date: { $gte: new Date().setHours(0,0,0,0) } });
        res.status(200).json({ success: true, data: { totalStudents: total, checkedToday: checked, remaining: total - checked } });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteMentor = async (req, res) => {
    try {
        const mentor = await User.findById(req.params.mentorId);
        await Student.updateMany({ mentor_id: mentor?._id }, { mentor_id: null, mentor_name: 'Not Assigned' });
        await User.findByIdAndDelete(req.params.mentorId);
        res.status(200).json({ success: true, message: 'Mentor deleted' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getStudents = async (req, res) => {
    try {
        const filter = req.query.mentor_id ? { mentor_id: req.query.mentor_id } : {};
        const students = await Student.find(filter).populate('mentor_id faculty_id', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: students });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteStudent = async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Student deleted' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getMentors = async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' }).sort({ name: 1 });
        res.status(200).json({ success: true, data: mentors });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
