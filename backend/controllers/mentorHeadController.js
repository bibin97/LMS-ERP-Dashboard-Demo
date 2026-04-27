const db = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// @desc    Register a new mentor
// @route   POST /api/mentor-head/register-mentor
// @access  Private (Mentor Head)
exports.registerMentor = async (req, res) => {
    try {
        const { name, email, phone_number, place, password } = req.body;

        // Validation
        if (!name || !email || !phone_number || !place || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields (name, email, phone_number, place, password)",
            });
        }

        // Check if mentor already exists
        const [existingPhone] = await db.query('SELECT id FROM users WHERE phone_number = ?', [phone_number]);
        const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existingPhone.length > 0) {
            return res.status(400).json({ success: false, message: "Mentor already registered with this phone number" });
        }
        if (existingEmail.length > 0) {
            return res.status(400).json({ success: false, message: "Mentor already registered with this email" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create mentor
        const mentorId = await User.create({
            name,
            email,
            phone_number,
            place,
            password: hashedPassword,
            role: 'mentor',
            status: 'pending',
            isApproved: 0,
            registeredBy: req.user.id
        });

        // Notify Admin
        const msg = `<span class="font-bold text-blue-600">${req.user.name}</span> <span class="text-xs bg-blue-100 text-blue-800 px-1 rounded">(Mentor Head)</span> added <span class="font-bold text-indigo-600">${name}</span> <span class="text-xs bg-indigo-100 text-indigo-800 px-1 rounded">(Mentor)</span>`;
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [msg]);

        res.status(201).json({
            success: true,
            message: "Mentor registration successful. Pending Admin approval.",
            mentorId
        });
    } catch (error) {
        console.error('Error in registerMentor:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Update a mentor's details (Handover account)
// @route   PUT /api/mentor-head/mentors/:mentorId
// @access  Private (Mentor Head)
// Consolidated version of editMentor moved to bottom for cleanliness, or just kept here. I'll keep one here and remove the others.
exports.editMentor = async (req, res) => {
    try {
        const id = req.params.mentorId || req.params.id;
        const { name, email, phone_number, place, password } = req.body;

        if (!name || !email || !phone_number) {
            return res.status(400).json({ success: false, message: "Name, email, and phone number are required fields" });
        }

        const [existingPhone] = await db.query('SELECT id FROM users WHERE phone_number = ? AND id != ?', [phone_number, id]);
        const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);

        if (existingPhone.length > 0) return res.status(400).json({ success: false, message: "Phone number already in use" });
        if (existingEmail.length > 0) return res.status(400).json({ success: false, message: "Email already in use" });

        let query = 'UPDATE users SET name = ?, email = ?, phone_number = ?, place = ?';
        let params = [name, email, phone_number, place || ''];

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ? AND role = "mentor"';
        params.push(id);

        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Mentor not found" });

        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Mentor Head (${req.user.name}) updated mentor: ${name}`]);
        res.status(200).json({ success: true, message: "Mentor updated successfully" });
    } catch (error) {
        console.error('Error updating mentor:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get dashboard stats (mentors with completed counts)
// @route   GET /api/mentor-head/dashboard
// @access  Private (Mentor Head)
exports.getDashboardStats = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id as mentor_id, 
                u.name as mentor_name, 
                u.phone_number,
                u.place,
                COUNT(sil.id) as completed_count
            FROM users u
            LEFT JOIN student_interaction_logs sil ON u.id = sil.mentor_id
            WHERE u.role = 'mentor'
            GROUP BY u.id, u.name, u.phone_number, u.place
            ORDER BY completed_count DESC
        `;

        const [mentors] = await db.query(query);

        res.status(200).json({
            success: true,
            data: mentors
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get mentor's completed student interactions
// @route   GET /api/mentor-head/mentor/:mentorId/students
// @access  Private (Mentor Head)
exports.getMentorStudents = async (req, res) => {
    try {
        const { mentorId } = req.params;

        const query = `
            SELECT 
                s.name as student_name, 
                sil.date,
                sil.id as log_id
            FROM student_interaction_logs sil
            JOIN students s ON s.id = sil.student_id
            WHERE sil.mentor_id = ?
            ORDER BY sil.date DESC
        `;

        const [students] = await db.query(query, [mentorId]);

        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error in getMentorStudents:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
// @desc    Get all mentor interaction logs (Student & Faculty calls)
// @route   GET /api/mentor-head/mentor-logs
// @access  Private (Mentor Head)
exports.getMentorInteractionLogs = async (req, res) => {
    try {
        const [studentLogs] = await db.query(`
            SELECT sil.*, sil.created_at, s.name as student_name, m.name as mentor_name, 'Student' as type
            FROM student_interaction_logs sil
            JOIN students s ON sil.student_id = s.id
            JOIN users m ON sil.mentor_id = m.id
            ORDER BY sil.created_at DESC
        `);

        const [facultyLogs] = await db.query(`
            SELECT fil.*, fil.created_at, s.name as student_name, m.name as mentor_name, 'Faculty' as type
            FROM faculty_interaction_logs fil
            JOIN students s ON fil.student_id = s.id
            JOIN users m ON fil.mentor_id = m.id
            ORDER BY fil.created_at DESC
        `);

        res.status(200).json({
            success: true,
            data: {
                studentLogs,
                facultyLogs
            }
        });
    } catch (error) {
        console.error('Error in getMentorInteractionLogs:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all intelligence reports submitted by faculties
// @route   GET /api/mentor-head/faculty-intelligence
// @access  Private (Mentor Head)
exports.getFacultyIntelligenceLogs = async (req, res) => {
    try {
        const [reports] = await db.query(`
            SELECT r.*, s.name as student_name, u.name as faculty_name
            FROM student_reports r
            JOIN students s ON r.student_id = s.id
            JOIN users u ON r.faculty_id = u.id
            ORDER BY r.created_at DESC
        `);

        res.status(200).json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Error in getFacultyIntelligenceLogs:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
// @desc    Get all recent activities (interaction logs) from all mentors
// @route   GET /api/mentor-head/activities
// @access  Private (Mentor Head)
exports.getAllActivities = async (req, res) => {
    try {
        const query = `
            (SELECT 
                sil.id as log_id,
                sil.created_at as date,
                sil.mentor_notes as details,
                s.name as student_name,
                m.name as mentor_name,
                m.place as mentor_place,
                'Mentor Interaction' as type
            FROM student_interaction_logs sil
            JOIN students s ON s.id = sil.student_id
            JOIN users m ON m.id = sil.mentor_id)
            UNION ALL
            (SELECT 
                fil.id as log_id,
                fil.created_at as date,
                fil.notes as details,
                s.name as student_name,
                m.name as mentor_name,
                m.place as mentor_place,
                'Faculty Interaction' as type
            FROM faculty_interaction_logs fil
            JOIN students s ON s.id = fil.student_id
            JOIN users m ON m.id = fil.mentor_id)
            ORDER BY date DESC
            LIMIT 50
        `;

        const [activities] = await db.query(query);

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Error in getAllActivities:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
// @desc    Get detailed view of a specific mentor
// @route   GET /api/mentor-head/mentor/:mentorId/details
// @access  Private (Mentor Head)
exports.getMentorDetails = async (req, res) => {
    try {
        const { mentorId } = req.params;

        // Parallel queries
        const [mentorProfile] = await db.query(
            'SELECT id, name, phone_number, place, status, createdAt as created_at FROM users WHERE id = ? AND role = "mentor"',
            [mentorId]
        );

        if (mentorProfile.length === 0) {
            return res.status(404).json({ success: false, message: "Mentor not found" });
        }

        const [assignedStudents] = await db.query(
            'SELECT id, name, grade, course, subject, onboarding_status, faculty_name, is_shifted, shifted_from FROM students WHERE mentor_id = ?',
            [mentorId]
        );

        const [interactionLogs] = await db.query(
            `SELECT sil.*, s.name as student_name 
             FROM student_interaction_logs sil 
             JOIN students s ON s.id = sil.student_id 
             WHERE sil.mentor_id = ? 
             ORDER BY sil.date DESC`,
            [mentorId]
        );

        const [facultyLogs] = await db.query(
            `SELECT fil.*, s.name as student_name 
             FROM faculty_interaction_logs fil 
             JOIN students s ON s.id = fil.student_id 
             WHERE fil.mentor_id = ? 
             ORDER BY fil.date DESC`,
            [mentorId]
        );

        res.status(200).json({
            success: true,
            data: {
                profile: mentorProfile[0],
                assignedStudents,
                logs: interactionLogs,
                facultyLogs
            }
        });
    } catch (error) {
        console.error('Error in getMentorDetails:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get Mentor Activity Dashboard
// @route   GET /api/mentor-head/mentor-activity
exports.getMentorActivityDashboard = async (req, res) => {
    try {
        // Fetch mentors with their basic counts first
        const query = `
            SELECT 
                u.id as mentor_id,
                u.name as mentor_name,
                u.email,
                u.phone_number,
                u.place,
                (SELECT COUNT(*) FROM students WHERE mentor_id = u.id) AS total_assigned_students,
                (SELECT COUNT(DISTINCT student_id) FROM student_interaction_logs WHERE mentor_id = u.id AND date = CURDATE() AND connected_today = TRUE) AS students_connected_today,
                (SELECT COUNT(*) FROM tasks WHERE mentor_id = u.id AND status = 'Completed' AND DATE(created_at) = CURDATE()) AS tasks_completed_today
            FROM users u
            WHERE u.role IN ('mentor', 'Mentor')
        `;
        const [mentors] = await db.query(query);

        // For each mentor, fetch their student list separately
        const mentorsWithStudents = await Promise.all(mentors.map(async (mentor) => {
            try {
                const [students] = await db.query(
                    'SELECT id, name, grade, course, faculty_name, is_shifted, shifted_from FROM students WHERE mentor_id = ?',
                    [mentor.mentor_id]
                );
                return {
                    ...mentor,
                    students_list: students
                };
            } catch (err) {
                console.error(`Error fetching students for mentor ${mentor.mentor_id}:`, err);
                return { ...mentor, students_list: [] };
            }
        }));

        res.status(200).json({ success: true, data: mentorsWithStudents });
    } catch (error) {
        console.error("Dashboard Global Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get specific mentor monitoring details
// @route   GET /api/mentor-head/mentors/:mentorId/monitoring
exports.getMentorMonitoringDetails = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const [mentorProfile] = await db.query('SELECT id, name, phone_number, place FROM users WHERE id = ?', [mentorId]);
        if (mentorProfile.length === 0) return res.status(404).json({ success: false, message: 'Mentor not found' });

        const [assignedStudents] = await db.query(`
            SELECT s.id, s.name, s.course, s.grade, s.onboarding_status, s.faculty_name, s.is_shifted, s.shifted_from,
                   CASE WHEN EXISTS(SELECT 1 FROM student_interaction_logs sil WHERE sil.student_id = s.id AND sil.date = CURDATE() AND sil.connected_today = TRUE) THEN 1 ELSE 0 END AS connected_today
            FROM students s
            WHERE s.mentor_id = ?
        `, [mentorId]);

        const [monthlyStats] = await db.query(`
            SELECT COUNT(DISTINCT CONCAT(student_id, date)) as total_connections 
            FROM student_interaction_logs 
            WHERE mentor_id = ? AND MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
        `, [mentorId]);

        res.status(200).json({
            success: true,
            data: {
                profile: mentorProfile[0],
                assignedStudents,
                todayConnectionCount: assignedStudents.filter(s => s.connected_today).length,
                monthlyConnections: monthlyStats[0].total_connections
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all students for shifting
// @route   GET /api/mentor-head/all-students
exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await db.query('SELECT id, name, course, grade, mentor_id, onboarding_status FROM students');
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Shift student to another mentor
// @route   PUT /api/mentor-head/students/:studentId/shift
exports.shiftStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { newMentorId } = req.body;

        const [oldMentorRes] = await db.query('SELECT mentor_name FROM students WHERE id = ?', [studentId]);
        const oldMentorName = oldMentorRes.length > 0 ? oldMentorRes[0].mentor_name : 'Unknown';

        const [mentor] = await db.query('SELECT name FROM users WHERE id = ?', [newMentorId]);
        if (mentor.length === 0) return res.status(404).json({ success: false, message: 'Mentor not found' });
        const mentorName = mentor[0].name;

        // Shift student, mark as shifted, and CLEAR faculty assignment
        await db.query(
            'UPDATE students SET mentor_id = ?, mentor_name = ?, faculty_id = NULL, faculty_name = "Not Assigned", is_shifted = 1, shifted_from = ? WHERE id = ?',
            [newMentorId, mentorName, oldMentorName, studentId]
        );

        // Preserve history and ensure it appears in the new mentor's activity/panel
        // We update the mentor_id to the new mentor so it shows up in their dashboard/lists
        // while the student_id keeps it tied to the student's history.
        await db.query('UPDATE student_interaction_logs SET mentor_id = ? WHERE student_id = ?', [newMentorId, studentId]);
        await db.query('UPDATE faculty_interaction_logs SET mentor_id = ? WHERE student_id = ?', [newMentorId, studentId]);
        await db.query('UPDATE mentor_timetable SET mentor_id = ? WHERE student_id = ?', [newMentorId, studentId]);
        await db.query('UPDATE daily_hours_log SET mentor_id = ? WHERE student_id = ?', [newMentorId, studentId]);

        // Notify
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Student shifted from ${oldMentorName} to ${mentorName}. All history transferred.`]);

        res.status(200).json({ success: true, message: 'Student and history shifted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Daily Student Checks (for Mentor Head)
// @route   GET /api/mentor-head/daily-student-checks
exports.getDailyStudentChecks = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.id as student_id,
                s.name as student_name,
                s.onboarding_status,
                u.name as mentor_name,
                (SELECT MAX(date) FROM student_interaction_logs WHERE student_id = s.id) AS last_interaction_date,
                (SELECT COUNT(*) FROM student_interaction_logs WHERE student_id = s.id) AS total_interaction_count,
                (SELECT COUNT(*) FROM student_verification WHERE student_id = s.id) AS total_check_count
            FROM students s
            LEFT JOIN users u ON s.mentor_id = u.id
        `;
        const [students] = await db.query(query);
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a manual check marker
// @route   POST /api/mentor-head/students/:studentId/check
exports.checkStudentToday = async (req, res) => {
    try {
        const { studentId } = req.params;
        const mentorHeadId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        // "Every click creates a new record. Repetition allowed"
        await db.query(
            'INSERT INTO student_verification (student_id, mentor_head_id, date) VALUES (?, ?, ?)',
            [studentId, mentorHeadId, today]
        );

        res.status(200).json({ success: true, message: 'Student verification check added' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove the latest manual check marker
// @route   DELETE /api/mentor-head/students/:studentId/uncheck
exports.uncheckStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        await db.query(`
            DELETE FROM student_verification 
            WHERE id = (
                SELECT id FROM (
                    SELECT id FROM student_verification 
                    WHERE student_id = ? 
                    ORDER BY id DESC LIMIT 1
                ) as t
            )
        `, [studentId]);

        res.status(200).json({ success: true, message: 'Latest student verification check removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Daily Summary (for Mentor Head)
// @route   GET /api/mentor-head/daily-summary
exports.getDailySummary = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) AS totalStudents FROM students');
        const [[{ checkedToday }]] = await db.query('SELECT COUNT(DISTINCT student_id) AS checkedToday FROM student_verification WHERE date = ?', [today]);

        const remaining = totalStudents - checkedToday;

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                checkedToday,
                remaining
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Edit Mentor Details
// @route   PUT /api/mentor-head/mentors/:mentorId
exports.editMentor = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { name, phone_number, place } = req.body;
        const mentorHeadName = req.user.name || 'Mentor Head';

        const [result] = await db.query(
            'UPDATE users SET name = ?, phone_number = ?, place = ? WHERE id = ? AND role = "mentor"',
            [name, phone_number, place, mentorId]
        );

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Mentor not found' });

        // Notify Admin
        const msg = `${mentorHeadName} updated details for mentor: ${name}`;
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [msg]);

        res.status(200).json({ success: true, message: 'Mentor updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Mentor
// @route   DELETE /api/mentor-head/mentors/:mentorId
exports.deleteMentor = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const mentorHeadName = req.user.name || 'Mentor Head';

        const [mentor] = await db.query('SELECT name FROM users WHERE id = ? AND role = "mentor"', [mentorId]);
        if (mentor.length === 0) return res.status(404).json({ success: false, message: 'Mentor not found' });

        const mentorName = mentor[0].name;

        await db.query('UPDATE students SET mentor_id = NULL WHERE mentor_id = ?', [mentorId]);
        await db.query('DELETE FROM users WHERE id = ? AND role = "mentor"', [mentorId]);

        const msg = `${mentorHeadName} deleted mentor: ${mentorName}`;
        try {
            await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [msg]);
        } catch (e) { }

        res.status(200).json({ success: true, message: 'Mentor deleted successfully' });
    } catch (error) {
        console.error('Error deleting mentor:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get exam analytics for graphs
exports.getExamAnalytics = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                subject, 
                term, 
                AVG(marks) as avg_marks, 
                AVG(total) as avg_total,
                (AVG(marks) / AVG(total)) * 100 as percentage
            FROM student_marks
            GROUP BY subject, term
            ORDER BY term DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Error fetching exam analytics:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.editStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, grade, subject, course } = req.body;
        const [[student]] = await db.query('SELECT name FROM students WHERE id = ?', [id]);
        await db.query('UPDATE students SET name = ?, grade = ?, subject = ?, course = ? WHERE id = ?', [name, grade, subject, course, id]);
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Mentor Head (${req.user.name}) edited student: ${student.name}`]);
        res.status(200).json({ success: true, message: 'Student updated' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const [[student]] = await db.query('SELECT name FROM students WHERE id = ?', [id]);
        await db.query('DELETE FROM students WHERE id = ?', [id]);
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Mentor Head (${req.user.name}) deleted student: ${student.name}`]);
        res.status(200).json({ success: true, message: 'Student deleted' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getFaculties = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, phone_number, place, status, createdAt FROM users WHERE role = "faculty" ORDER BY name ASC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getStudents = async (req, res) => {
    try {
        const { mentor_id } = req.query;
        let query = 'SELECT s.*, m.name as mentor_name, f.name as faculty_name FROM students s LEFT JOIN users m ON s.mentor_id = m.id LEFT JOIN users f ON s.faculty_id = f.id';
        let params = [];
        
        if (mentor_id) {
            query += ' WHERE s.mentor_id = ?';
            params.push(mentor_id);
        }
        
        query += ' ORDER BY s.created_at DESC';
        const [rows] = await db.query(query, params);
        res.status(200).json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.editFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone_number, place } = req.body;
        const [[user]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
        await db.query('UPDATE users SET name = ?, email = ?, phone_number = ?, place = ? WHERE id = ?', [name, email, phone_number, place, id]);
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Mentor Head (${req.user.name}) edited faculty: ${user.name}`]);
        res.status(200).json({ success: true, message: 'Faculty updated' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const [[user]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
        await db.query('DELETE FROM users WHERE id = ?', [id]);
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Mentor Head (${req.user.name}) deleted faculty: ${user.name}`]);
        res.status(200).json({ success: true, message: 'Faculty deleted' });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getMentors = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.name, u.email, u.phone_number, u.place, u.status,
            (SELECT COUNT(*) FROM students WHERE mentor_id = u.id) as studentCount
            FROM users u WHERE u.role = 'mentor' ORDER BY u.name ASC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Toggle Course Completed status for a student
// @route   PUT /api/mentor-head/students/:studentId/course-complete
exports.toggleCourseCompleted = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { isCompleted } = req.body;

        await db.query('UPDATE students SET course_completed = ? WHERE id = ?', [isCompleted ? 1 : 0, studentId]);

        const [[student]] = await db.query('SELECT name FROM students WHERE id = ?', [studentId]);
        const statusMsg = isCompleted ? 'marked as Course Completed' : 'unmarked from Course Completed';
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Mentor Head (${req.user.name}) ${statusMsg} for student: ${student.name}`]);

        res.status(200).json({ success: true, message: `Student ${statusMsg}` });
    } catch (error) {
        console.error('Error in toggleCourseCompleted:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// End of file cleanup

