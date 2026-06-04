const User = require('../models/userModel');
const Student = require('../models/Student');
const MentorSession = require('../models/MentorSession');
const AdminNotification = require('../models/AdminNotification');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc    Register a student
// @route   POST /api/register/student
const registerStudent = async (req, res) => {
    try {
        const {
            name, grade, subject, course, hour, time_table,
            mentor_name, faculty_name, next_installment_date, enrollment_type
        } = req.body;

        const badge = enrollment_type === 'Mentorship' ? 'Gold' : 
                      enrollment_type === 'Tuition' ? 'Silver' : 
                      enrollment_type === 'Mentorship and Tuition' ? 'Diamond' : null;

        // Find mentor and faculty IDs if names provided
        let mentorId = null;
        let facultyId = null;

        if (mentor_name) {
            const mentor = await User.findOne({ name: mentor_name, role: 'mentor' });
            mentorId = mentor?._id;
        }
        if (faculty_name) {
            const faculty = await User.findOne({ name: faculty_name, role: 'faculty' });
            facultyId = faculty?._id;
        }

        const newStudent = new Student({
            name, grade, subject, course, hour,
            time_table, mentor_id: mentorId, faculty_id: facultyId,
            next_installment_date, enrollment_type, badge
        });

        await newStudent.save();

        // Notify Admin
        await AdminNotification.create({
            message: `<b>New Student Registration:</b> ${name} registered for <b>${course}</b> (${grade}).`
        });

        // Automatically insert initial session into mentor_timetable if mentor exists
        if (mentorId) {
            await MentorSession.create({
                mentor_id: mentorId,
                student_id: newStudent._id,
                session_number: 1,
                date: new Date(),
                status: 'Scheduled',
                chapter: 'Initial Introduction Session',
                start_time: '10:00',
                end_time: '11:00',
                duration: '1h 0m',
                session_type: 'Regular Class'
            });
        }

        res.status(201).json({
            success: true,
            message: "Student registered and session scheduled",
            studentId: newStudent._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register a mentor
const registerMentor = async (req, res) => {
    try {
        const { name, phone_number } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(phone_number, salt);

        const newUser = new User({
            name,
            email: phone_number,
            password: hashedPassword,
            role: 'mentor',
            status: 'pending',
            isApproved: false,
            isActive: false
        });

        await newUser.save();

        await AdminNotification.create({
            message: `<b>Mentor Application:</b> ${name} has requested access. <span style="color:#F59E0B">Pending Admin Approval</span>.`
        });

        const token = jwt.sign(
            { id: newUser._id, role: 'mentor' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: "Mentor registered successfully and logged in",
            token,
            role: 'mentor',
            user: {
                id: newUser._id,
                name,
                email: phone_number,
                role: 'mentor'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register a faculty
const registerFaculty = async (req, res) => {
    try {
        const { name, phone_number } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(phone_number, salt);

        const newUser = new User({
            name,
            email: phone_number,
            password: hashedPassword,
            role: 'faculty',
            status: 'pending',
            isApproved: false,
            isActive: false
        });

        await newUser.save();

        await AdminNotification.create({
            message: `<b>Faculty Application:</b> ${name} has requested access. <span style="color:#F59E0B">Pending Admin Approval</span>.`
        });

        const token = jwt.sign(
            { id: newUser._id, role: 'faculty' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: "Faculty registered successfully and logged in",
            token,
            role: 'faculty',
            user: {
                id: newUser._id,
                name,
                email: phone_number,
                role: 'faculty'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all mentors
const getMentors = async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' }).select('name').sort({ name: 1 });
        res.status(200).json({ success: true, data: mentors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all faculties
const getFaculties = async (req, res) => {
    try {
        const faculties = await User.find({ role: 'faculty' }).select('name').sort({ name: 1 });
        res.status(200).json({ success: true, data: faculties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    registerStudent,
    registerMentor,
    registerFaculty,
    getMentors,
    getFaculties
};
