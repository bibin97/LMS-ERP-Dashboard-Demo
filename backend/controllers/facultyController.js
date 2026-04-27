const db = require('../config/db');
const User = require('../models/userModel');

// @desc    Get dashboard stats for faculty
// @route   GET /api/faculty/dashboard
const getDashboard = async (req, res) => {
    try {
        const facultyId = req.user.id;

        // 1. Total Assigned Students
        const [[{ totalStudents }]] = await db.query(
            'SELECT COUNT(*) as totalStudents FROM students WHERE faculty_id = ?',
            [facultyId]
        );

        // 2. Pending Reports (Open reports)
        const [[{ pendingReports }]] = await db.query(
            'SELECT COUNT(*) as pendingReports FROM student_reports WHERE faculty_id = ? AND status = "Open"',
            [facultyId]
        );

        // 3. Upcoming Sessions (Today)
        const [[{ upcomingSessions }]] = await db.query(
            'SELECT COUNT(*) as upcomingSessions FROM faculty_sessions WHERE faculty_id = ? AND date = CURDATE() AND status = "Scheduled"',
            [facultyId]
        );

        // 4. Completed Sessions
        const [[{ completedSessions }]] = await db.query(
            'SELECT COUNT(*) as completedSessions FROM faculty_sessions WHERE faculty_id = ? AND status = "Completed"',
            [facultyId]
        );

        // 5. Tasks Pending
        const [[{ pendingTasks }]] = await db.query(
            'SELECT COUNT(*) as pendingTasks FROM tasks WHERE assigned_to = ? AND status = "Pending"',
            [facultyId]
        );

        // 6. Performance Overview (Distribution of students across performance statuses)
        const [performanceData] = await db.query(`
            SELECT performance_status as status, COUNT(*) as count 
            FROM students 
            WHERE faculty_id = ? 
            GROUP BY performance_status
        `, [facultyId]);

        // 7. Attendance Overview (Averaged attendance over the last 7 days from session_attendance)
        const [attendanceData] = await db.query(`
            SELECT s.date, 
                   (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100 as percentage
            FROM faculty_sessions s
            JOIN session_attendance a ON s.id = a.session_id
            WHERE s.faculty_id = ?
            GROUP BY s.date
            ORDER BY s.date DESC
            LIMIT 7
        `, [facultyId]);

        res.status(200).json({
            success: true,
            data: {
                badges: {
                    totalStudents,
                    pendingReports,
                    upcomingSessions,
                    completedSessions,
                    pendingTasks
                },
                charts: {
                    performance: performanceData,
                    attendance: attendanceData.reverse()
                }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Dashboard error", error: error.message });
    }
};

// @desc    Get assigned students
// @route   GET /api/faculty/students
const getStudents = async (req, res) => {
    try {
        const facultyId = req.user.id;
        const [students] = await db.query(`
            SELECT id, name, roll_number, department, attendance_percentage, performance_status, status, created_at, badge
            FROM students
            WHERE faculty_id = ?
        `, [facultyId]);

        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student detailed profile
// @route   GET /api/faculty/students/:id
const getStudentProfile = async (req, res) => {
    try {
        const facultyId = req.user.id;
        const studentId = req.params.id;

        // Verify assignment
        const [check] = await db.query('SELECT * FROM students WHERE id = ? AND faculty_id = ?', [studentId, facultyId]);
        if (check.length === 0) return res.status(403).json({ success: false, message: "Student not assigned to you" });

        const [student] = await db.query('SELECT * FROM students WHERE id = ?', [studentId]);
        const [marks] = await db.query('SELECT * FROM student_marks WHERE student_id = ? ORDER BY created_at DESC', [studentId]);
        const [attendance] = await db.query(`
            SELECT a.*, s.topic, s.date 
            FROM session_attendance a
            JOIN faculty_sessions s ON a.session_id = s.id
            WHERE a.student_id = ?
            ORDER BY s.date DESC
        `, [studentId]);
        const [reports] = await db.query('SELECT * FROM student_reports WHERE student_id = ? ORDER BY created_at DESC', [studentId]);

        res.status(200).json({
            success: true,
            data: {
                profile: student[0],
                marks,
                attendance,
                reports
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Session Management
const createSession = async (req, res) => {
    const { topic, date, studentIds } = req.body;
    const facultyId = req.user.id;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [sessionResult] = await connection.query(
            'INSERT INTO faculty_sessions (faculty_id, topic, date, status) VALUES (?, ?, ?, "Scheduled")',
            [facultyId, topic, date]
        );

        const sessionId = sessionResult.insertId;

        if (studentIds && studentIds.length > 0) {
            const attendanceValues = studentIds.map(sid => [sessionId, sid, 'Present']);
            await connection.query(
                'INSERT INTO session_attendance (session_id, student_id, status) VALUES ?',
                [attendanceValues]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: "Session created with students" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

const getSessions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, 
                   (SELECT COUNT(*) FROM session_attendance WHERE session_id = s.id) as student_count
            FROM faculty_sessions s
            WHERE s.faculty_id = ?
            ORDER BY s.date DESC
        `, [req.user.id]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const completeSession = async (req, res) => {
    try {
        const { attendance } = req.body; // Array of {student_id, status}
        const sessionId = req.params.id;

        const connection = await db.getConnection();
        await connection.beginTransaction();

        await connection.query('UPDATE faculty_sessions SET status = "Completed" WHERE id = ?', [sessionId]);

        if (attendance && attendance.length > 0) {
            for (const record of attendance) {
                await connection.query(
                    'UPDATE session_attendance SET status = ? WHERE session_id = ? AND student_id = ?',
                    [record.status, sessionId, record.student_id]
                );
            }
        }

        await connection.commit();
        connection.release();
        res.status(200).json({ success: true, message: "Session marked as completed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Interaction Reports
const submitReport = async (req, res) => {
    const { student_id, type, remarks, action_taken, status, follow_up_date } = req.body;
    try {
        await db.query(`
            INSERT INTO student_reports (faculty_id, student_id, type, remarks, action_taken, status, follow_up_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [req.user.id, student_id, type, remarks, action_taken, status || 'Open', follow_up_date || null]);
        res.status(201).json({ success: true, message: "Report submitted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getReports = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.*, s.name as student_name
            FROM student_reports r
            JOIN students s ON r.student_id = s.id
            WHERE r.faculty_id = ?
            ORDER BY r.created_at DESC
        `, [req.user.id]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Task Section
const getFacultyTasks = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, u.name as assigned_by_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_by = u.id
            WHERE t.assigned_to = ?
            ORDER BY t.deadline ASC
        `, [req.user.id]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const submitTaskProof = async (req, res) => {
    try {
        const taskId = req.params.id;
        const proof_url = req.file ? req.file.path : null;

        await db.query(`
            UPDATE tasks SET status = "Completed", proof_url = ? WHERE id = ? AND assigned_to = ?
        `, [proof_url, taskId, req.user.id]);

        res.status(200).json({ success: true, message: "Task marked as completed with proof" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Document Management
const uploadDocument = async (req, res) => {
    try {
        const { title } = req.body;
        const file_url = req.file ? req.file.path : null;
        const file_type = req.file ? req.file.mimetype : null;

        if (!file_url) return res.status(400).json({ success: false, message: "File required" });

        await db.query(`
            INSERT INTO faculty_documents (faculty_id, title, file_url, file_type)
            VALUES (?, ?, ?, ?)
        `, [req.user.id, title, file_url, file_type]);

        res.status(201).json({ success: true, message: "Document uploaded to Cloudinary" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDocuments = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM faculty_documents WHERE faculty_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const [doc] = await db.query('SELECT * FROM faculty_documents WHERE id = ? AND faculty_id = ?', [req.params.id, req.user.id]);
        if (doc.length === 0) return res.status(404).json({ success: false, message: "Document not found" });

        // Optionally delete from Cloudinary here if you have the public_id
        await db.query('DELETE FROM faculty_documents WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: "Document deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Notifications
const getNotifications = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markRead = async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Profile Settings
const updateProfile = async (req, res) => {
    try {
        const { phone_number, password } = req.body;
        const updates = [];
        const params = [];

        if (phone_number) {
            updates.push('phone_number = ?');
            params.push(phone_number);
        }

        if (password) {
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updates.push('password = ?');
            params.push(hashedPassword);
        }

        if (req.file) {
            updates.push('profile_image = ?'); // Assuming you add this column or use existing
            params.push(req.file.path);
        }

        if (updates.length === 0) return res.status(400).json({ success: false, message: "No updates provided" });

        params.push(req.user.id);
        await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logs submitted by mentors for this faculty's students
const getMentorLogs = async (req, res) => {
    try {
        const facultyId = req.user.id;
        const [rows] = await db.query(`
            SELECT logs.*, s.name as student_name, u.name as mentor_name,
            IF(logs.parent_update_needed = 1, 'Yes', 'No') as parent_update_needed
            FROM faculty_interaction_logs logs
            JOIN students s ON logs.student_id = s.id
            LEFT JOIN users u ON logs.mentor_id = u.id
            WHERE logs.faculty_id = ?
            ORDER BY logs.date DESC, logs.session_number DESC
        `, [facultyId]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get student exam scores
const getStudentExamScores = async (req, res) => {
    try {
        const facultyId = req.user.id;
        const [rows] = await db.query(`
            SELECT m.*, s.name as student_name
            FROM student_marks m
            JOIN students s ON m.student_id = s.id
            WHERE s.faculty_id = ?
            ORDER BY m.exam_date DESC, m.created_at DESC
        `, [facultyId]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit exam score
const submitExamScore = async (req, res) => {
    const { student_id, subject, marks, total, grade, term, exam_date } = req.body;
    const facultyId = req.user.id;

    try {
        await db.query(`
            INSERT INTO student_marks (student_id, faculty_id, subject, marks, total, grade, term, exam_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [student_id, facultyId, subject, marks, total, grade, term, exam_date]);

        res.status(201).json({ success: true, message: "Exam score submitted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboard,
    getStudents,
    getStudentProfile,
    createSession,
    getSessions,
    completeSession,
    submitReport,
    getReports,
    getFacultyTasks,
    submitTaskProof,
    uploadDocument,
    getDocuments,
    deleteDocument,
    getNotifications,
    markRead,
    updateProfile,
    getMentorLogs,
    getStudentExamScores,
    submitExamScore
};
