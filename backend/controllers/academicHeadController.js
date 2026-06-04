const User = require('../models/userModel');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Report = require('../models/Report');
const Task = require('../models/Task');
const AdminNotification = require('../models/AdminNotification');
const AcademicDocument = require('../models/AcademicDocument');
const StudentExam = require('../models/StudentExam');

// @desc    Get exam analytics
const getExamAnalytics = async (req, res) => {
    try {
        const { student_id } = req.query;
        let stats;
        if (student_id) {
            const raw = await StudentExam.find({ student_id, status: 'Completed' }).select('milestone_session score');
            stats = raw.map(s => ({ subject: s.milestone_session, percentage: s.score }));
        } else {
            stats = await StudentExam.aggregate([
                { $match: { status: 'Completed' } },
                { $group: { _id: '$milestone_session', percentage: { $avg: '$score' } } },
                { $project: { subject: '$_id', percentage: 1, _id: 0 } }
            ]);
        }
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get dashboard stats
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments({ status: 'active' });
        const totalFaculties = await User.countDocuments({ role: 'faculty', status: 'active' });
        const totalMentors = await User.countDocuments({ role: 'mentor', status: 'active' });

        const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(); endOfDay.setHours(23,59,59,999);

        const schedule = await Session.find({ date: { $gte: startOfDay, $lte: endOfDay } })
            .populate('faculty_id', 'name').populate('student_ids', 'name');

        const reports = await Report.find().sort({ createdAt: -1 }).limit(5)
            .populate('student_id', 'name').populate('faculty_id', 'name');

        const activityFeed = reports.map(r => ({
            type: 'Student Report',
            details: r.remarks,
            student_name: r.student_id?.name || 'Unknown',
            origin_name: r.faculty_id?.name || 'System',
            date: r.createdAt
        }));

        res.status(200).json({ success: true, data: { stats: { totalStudents, totalFaculties, totalMentors, todaySessions: schedule.length }, schedule, activityFeed } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all faculty sessions and reports
const getAllFacultyActivity = async (req, res) => {
    try {
        const sessions = await Session.find().sort({ date: -1 }).populate('faculty_id', 'name');
        const reports = await Report.find().sort({ createdAt: -1 })
            .populate('student_id', 'name').populate('faculty_id', 'name');
        res.status(200).json({ success: true, data: { sessions, reports } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get dropdown data
const getDropdownData = async (req, res) => {
    try {
        const mentors    = await User.find({ role: 'mentor', status: 'active' }).select('_id name');
        const mentorHeads = await User.find({ role: 'mentor_head', status: 'active' }).select('_id name');
        const faculties  = await User.find({ role: 'faculty', status: 'active' }).select('_id name');
        res.status(200).json({ success: true, data: { mentors, mentorHeads, faculties } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register student
const registerStudent = async (req, res) => {
    try {
        const { name, email, password, grade, mentorId, course, hour, registrationNumber, meetingLink, enrollmentType, selectedSubjects } = req.body;

        const identifier = email || req.body.phone_number;
        const existingUser = await User.findByIdentifier(identifier);
        if (existingUser) return res.status(400).json({ success: false, message: 'Identifier already registered' });

        const badge = enrollmentType === 'Mentorship' ? 'Gold' : enrollmentType === 'Tuition' ? 'Silver' : enrollmentType === 'Mentorship and Tuition' ? 'Diamond' : null;

        const student = new Student({
            name, email, password, grade, course, hour,
            mentor_id: mentorId,
            status: 'active', isApproved: 1,
            registeredBy: req.user.id,
            registration_number: registrationNumber,
            meeting_link: meetingLink,
            enrollment_type: enrollmentType, badge,
            faculty_id: selectedSubjects?.[0]?.facultyId,
            faculty_name: selectedSubjects?.[0]?.facultyName,
            subject: selectedSubjects?.[0]?.subject
        });
        await student.save();

        await AdminNotification.create({ message: `<b>Academic Update:</b> <span style="color:#008080">${req.user.name}</span> registered new student <b>${name}</b> for ${course}.` });
        res.status(201).json({ success: true, message: 'Student registered successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register faculty
const registerFaculty = async (req, res) => {
    try {
        const { name, email, phone_number, place, password } = req.body;
        const newUser = new User({ name, email: email?.trim(), phone_number: phone_number?.trim(), place, password, role: 'faculty', status: 'active', isApproved: 1, isActive: 1, registeredBy: req.user.id });
        await newUser.save();
        await AdminNotification.create({ message: `<b>Staff Onboarding:</b> ${req.user.name} added faculty <b>${name}</b>.` });
        res.status(201).json({ success: true, message: 'Faculty activated.', userId: newUser._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Student interaction logs
const getStudentInteractionLogs = async (req, res) => {
    try {
        const logs = await Report.find().sort({ createdAt: -1 })
            .populate('student_id', 'name').populate('faculty_id', 'name');
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Faculty interaction logs
const getFacultyInteractionLogs = async (req, res) => {
    try {
        const facultyLogs = await Session.find({ status: 'Completed' }).sort({ date: -1 }).populate('faculty_id', 'name');
        res.status(200).json({ success: true, data: { mentorLogs: [], facultyLogs } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Academic actions / milestones
const getAcademicActions = async (req, res) => {
    try {
        const today = new Date(); today.setHours(0,0,0,0);
        const endOfDay = new Date(today); endOfDay.setHours(23,59,59,999);

        const pendingExams = await StudentExam.find({ status: { $ne: 'Completed' } })
            .populate('student_id', 'name').populate('mentor_id', 'name');

        const dailyLogs = await Session.find({ date: { $gte: today, $lte: endOfDay } }).populate('faculty_id', 'name');

        res.status(200).json({ success: true, data: { milestones: pendingExams, dailyLogs } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Daily faculty checks
const getDailyFacultyChecks = async (req, res) => {
    try {
        const sessions = await Session.find({ status: 'Completed' }).sort({ date: -1 })
            .populate('faculty_id', 'name').populate('student_ids', 'name');
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check faculty session (stub — verification model not created yet)
const checkFacultySessionToday = async (req, res) => {
    res.status(200).json({ success: true, message: 'Faculty session audit noted.' });
};

// @desc    Uncheck faculty session (stub)
const uncheckFacultySession = async (req, res) => {
    res.status(200).json({ success: true, message: 'Faculty session audit removed.' });
};

// @desc    Get faculty directory
const getFacultyDirectory = async (req, res) => {
    try {
        const { sortBy } = req.query;
        let sortOption = { name: 1 };
        if (sortBy === 'newest') sortOption = { createdAt: -1 };
        else if (sortBy === 'oldest') sortOption = { createdAt: 1 };

        const faculties = await User.find({ role: 'faculty' }).sort(sortOption).select('-password');

        const enriched = await Promise.all(faculties.map(async (f) => {
            const studentCount = await Student.countDocuments({ faculty_id: f._id, status: 'active' });
            const assignedStudents = await Student.find({ faculty_id: f._id, status: 'active' }).select('name grade subject');
            return { ...f.toObject(), studentCount, assignedStudents };
        }));

        if (sortBy === 'most_students') enriched.sort((a, b) => b.studentCount - a.studentCount);

        res.status(200).json({ success: true, count: enriched.length, data: enriched });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get academic documents
const getAcademicDocuments = async (req, res) => {
    try {
        const docs = await AcademicDocument.find().sort({ createdAt: -1 }).populate('uploaded_by', 'name');
        res.status(200).json({ success: true, data: docs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload academic document
const uploadAcademicDocument = async (req, res) => {
    try {
        const { title, description, file_url, category } = req.body;
        if (!title || !file_url) return res.status(400).json({ success: false, message: 'Title and File URL required' });
        await AcademicDocument.create({ title, description, file_url, uploaded_by: req.user.id, category: category || 'General' });
        res.status(201).json({ success: true, message: 'Document uploaded.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete academic document
const deleteAcademicDocument = async (req, res) => {
    try {
        await AcademicDocument.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Document deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Save exam plan
const saveExamPlan = async (req, res) => {
    try {
        const { student_id, milestone, chapter, portions, exam_type, scheduled_date, mentor_id } = req.body;
        if (!student_id || !milestone || !portions || !scheduled_date)
            return res.status(400).json({ success: false, message: 'Required fields missing' });

        await StudentExam.findOneAndUpdate(
            { student_id, milestone_session: milestone },
            { chapter, portions, exam_type, scheduled_date, mentor_id, status: 'Pending' },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: 'Exam plan saved.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Edit faculty
const editFaculty = async (req, res) => {
    try {
        const { name, email, phone_number, place, faculty_id, hourly_rate } = req.body;
        const updates = { name, email, phone_number, place };
        if (faculty_id !== undefined) updates.faculty_id = faculty_id;
        if (hourly_rate !== undefined) updates.hourly_rate = Number(hourly_rate);

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'Faculty not found' });
        await AdminNotification.create({ message: `Academic Head (${req.user.name}) edited faculty: ${user.name}` });
        res.status(200).json({ success: true, message: 'Faculty updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete faculty
const deleteFaculty = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Faculty not found' });
        await AdminNotification.create({ message: `Academic Head (${req.user.name}) deleted faculty: ${user.name}` });
        res.status(200).json({ success: true, message: 'Faculty deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Edit student
const editStudent = async (req, res) => {
    try {
        const { name, grade, subject, course, email, meetingLink, meeting_link } = req.body;
        const student = await Student.findByIdAndUpdate(req.params.id, {
            name, grade, subject, course, email,
            meeting_link: meetingLink || meeting_link
        }, { new: true });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        await AdminNotification.create({ message: `Academic Head (${req.user.name}) updated student: ${student.name}` });
        res.status(200).json({ success: true, message: 'Student updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete student
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        await AdminNotification.create({ message: `Academic Head (${req.user.name}) deleted student: ${student.name}` });
        res.status(200).json({ success: true, message: 'Student deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Edit mentor
const editMentor = async (req, res) => {
    try {
        const { name, email, phone_number, place } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { name, email, phone_number, place }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: 'Mentor not found' });
        await AdminNotification.create({ message: `Academic Head (${req.user.name}) edited mentor: ${user.name}` });
        res.status(200).json({ success: true, message: 'Mentor updated.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete mentor
const deleteMentor = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Mentor not found' });
        await AdminNotification.create({ message: `Academic Head (${req.user.name}) deleted mentor: ${user.name}` });
        res.status(200).json({ success: true, message: 'Mentor deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Stubs for live class evaluations and pending logs (require new models if needed)
const getLiveClassEvaluations = async (req, res) => res.status(200).json({ success: true, data: [] });
const submitLiveClassEvaluation = async (req, res) => res.status(201).json({ success: true, message: 'Evaluation noted.' });
const getPendingFacultyLogs = async (req, res) => {
    try {
        const logs = await Session.find({ status: 'Completed' }).populate('faculty_id', 'name').populate('student_ids', 'name');
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
const verifyFacultyLog = async (req, res) => res.status(200).json({ success: true, message: 'Log verified.' });

module.exports = {
    getExamAnalytics, getDashboardStats, getAllFacultyActivity,
    getDropdownData, registerStudent, registerFaculty,
    getStudentInteractionLogs, getFacultyInteractionLogs,
    getAcademicActions, getDailyFacultyChecks,
    checkFacultySessionToday, uncheckFacultySession,
    getFacultyDirectory, getAcademicDocuments,
    uploadAcademicDocument, deleteAcademicDocument,
    saveExamPlan, getLiveClassEvaluations, submitLiveClassEvaluation,
    getPendingFacultyLogs, verifyFacultyLog,
    editFaculty, deleteFaculty, editStudent, deleteStudent,
    editMentor, deleteMentor
};
