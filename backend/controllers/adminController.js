const User = require('../models/userModel');
const Student = require('../models/Student');

// @desc    Get dashboard counts (robust summary)
// @route   GET /api/admin/dashboard-summary
const getAdminDashboardSummary = async (req, res) => {
    try {
        const students = await Student.countDocuments();
        const mentors = await User.countDocuments({ role: 'mentor' });
        const faculties = await User.countDocuments({ role: 'faculty' });
        const pending = await User.countDocuments({ 
            $or: [{ status: 'pending' }, { isApproved: 0 }],
            status: { $ne: 'rejected' }
        });

        res.status(200).json({
            success: true,
            data: {
                students,
                mentors,
                faculties,
                pendingApprovals: pending
            }
        });
    } catch (error) {
        console.error("DASHBOARD_SUMMARY_ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (super_admin, admin)
const getUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, status FROM users');
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (super_admin, admin)
const getUserById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Approve user (set status to active)
// @route   PUT /api/admin/approve/:id
// @access  Private (super_admin, admin)
const approveUser = async (req, res) => {
    try {
        const { role } = req.body;
        const { id } = req.params;
        let result;
        let nameRow;

        if (role === 'student') {
            [[nameRow]] = await db.query('SELECT name FROM students WHERE id = ?', [id]);
            [result] = await db.query('UPDATE students SET status = "active", isApproved = 1 WHERE id = ?', [id]);
        } else {
            [[nameRow]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
            [result] = await db.query('UPDATE users SET status = "active", isApproved = 1, isActive = 1 WHERE id = ?', [id]);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User/Student not found" });
        }

        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [
            `<b>Approval Success:</b> ${nameRow?.name || id} is now <span style="color:#008080">Active</span>.`
        ]);
        res.status(200).json({ success: true, message: "Approved successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Block user (set status to inactive)
// @route   PUT /api/admin/block/:id
// @access  Private (super_admin, admin)
const blockUser = async (req, res) => {
    try {
        const role = req.body.role || req.query.role;
        const { id } = req.params;
        let result;
        let nameRow;

        if (role === 'student') {
            [[nameRow]] = await db.query('SELECT name FROM students WHERE id = ?', [id]);
            [result] = await db.query('UPDATE students SET status = "inactive" WHERE id = ?', [id]);
        } else {
            [[nameRow]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
            [result] = await db.query('UPDATE users SET status = "inactive" WHERE id = ?', [id]);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [
            `<b>Security Alert:</b> ${role} <b>${nameRow?.name || id}</b> has been <span style="color:#e11d48">Blocked</span> by Admin.`
        ]);
        res.status(200).json({ success: true, message: "User blocked successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get pending users
// @route   GET /api/admin/pending
// @access  Private (super_admin, admin)
const getPendingUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.id, u.name, u.email, u.phone_number, u.role, u.place, u.status, u.createdAt as created_at,
                   rb.name as registered_by_name
            FROM users u
            LEFT JOIN users rb ON u.registeredBy = rb.id
            WHERE (u.status = "pending" OR u.isApproved = 0) AND u.status != 'rejected'
        `);

        // Attempt to fetch students with status pending
        let students = [];
        try {
            const [studentRows] = await db.query(`
                SELECT s.id, s.name, NULL as email, NULL as phone_number, 'student' as role, NULL as place, s.status, s.created_at,
                       rb.name as registered_by_name
                FROM students s
                LEFT JOIN users rb ON s.registeredBy = rb.id
                WHERE (s.status = 'pending' OR s.isApproved = 0) AND s.status != 'rejected'
            `);
            students = studentRows;
        } catch (e) {
            console.error("Warning: 'status' or 'isApproved' column issue in students table.", e.message);
        }

        const combined = [...users, ...students];
        const enrichedRows = combined.map(r => ({ ...r, created_at: r.created_at || new Date() }));

        res.status(200).json({ success: true, count: enrichedRows.length, data: enrichedRows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Reject user (set status to rejected)
// @route   PUT /api/admin/reject/:id
// @access  Private (super_admin, admin)
const rejectUser = async (req, res) => {
    try {
        const { role } = req.body;
        let result;

        if (role === 'student') {
            [result] = await db.query('UPDATE students SET status = "rejected", isApproved = 0 WHERE id = ?', [req.params.id]);
        } else {
            [result] = await db.query('UPDATE users SET status = "rejected", isApproved = 0, isActive = 0 WHERE id = ?', [req.params.id]);
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User/Student not found" });
        }
        res.status(200).json({ success: true, message: "Registration rejected" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/delete/:id
// @access  Private (super_admin, admin)
const deleteUser = async (req, res) => {
    const { id } = req.params;
    const role = req.query?.role || req.body?.role;

    try {
        if (role === 'student') {
            const [[student]] = await db.query('SELECT name FROM students WHERE id = ?', [id]);
            if (!student) return res.status(404).json({ success: false, message: "Student not found" });

            // Dependency Cleanup for Students
            await db.query('DELETE FROM student_interaction_logs WHERE student_id = ?', [id]);
            await db.query('DELETE FROM faculty_interaction_logs WHERE student_id = ?', [id]);
            await db.query('DELETE FROM student_verification WHERE student_id = ?', [id]);
            await db.query('DELETE FROM daily_hours_log WHERE student_id = ?', [id]);
            await db.query('DELETE FROM student_marks WHERE student_id = ?', [id]);
            await db.query('DELETE FROM student_exams WHERE student_id = ?', [id]);
            await db.query('DELETE FROM session_attendance WHERE student_id = ?', [id]);
            await db.query('DELETE FROM student_reports WHERE student_id = ?', [id]);
            await db.query('DELETE FROM live_class_feedbacks WHERE student_id = ?', [id]);
            await db.query('DELETE FROM mentor_timetable WHERE student_id = ?', [id]);

            await db.query('DELETE FROM students WHERE id = ?', [id]);
            res.status(200).json({ success: true, message: "Student deleted successfully" });
        } else {
            const [users] = await db.query('SELECT id, name, role, status FROM users WHERE id = ?', [id]);
            if (users.length === 0) return res.status(404).json({ success: false, message: "User not found" });

            const target = users[0];
            const userRole = target.role;

            if (userRole === 'super_admin' && target.status === 'active') {
                return res.status(403).json({ success: false, message: "Active Super Admin cannot be deleted." });
            }

            // Consolidated Resilient Cleanup for ALL potential tables
            const cleanupQueries = [
                'UPDATE users SET registeredBy = NULL WHERE registeredBy = ?',
                'UPDATE students SET registeredBy = NULL WHERE registeredBy = ?',
                'UPDATE tasks SET assigned_by = NULL WHERE assigned_by = ?',
                'UPDATE tasks SET assigned_to = NULL WHERE assigned_to = ?',
                'UPDATE students SET mentor_id = NULL, mentor_name = "Not Assigned" WHERE mentor_id = ?',
                'UPDATE students SET faculty_id = NULL, faculty_name = "Not Assigned" WHERE faculty_id = ?',
                'DELETE FROM faculty_sessions WHERE faculty_id = ?',
                'DELETE FROM student_marks WHERE faculty_id = ?',
                'DELETE FROM student_reports WHERE faculty_id = ?',
                'DELETE FROM faculty_documents WHERE faculty_id = ?',
                'DELETE FROM faculty_interaction_logs WHERE faculty_id = ?',
                'DELETE FROM mentorship_logs WHERE mentor_id = ?',
                'DELETE FROM faculty_verification WHERE academic_head_id = ? OR faculty_id = ?',
                'DELETE FROM student_interaction_logs WHERE mentor_id = ?',
                'DELETE FROM daily_hours_log WHERE mentor_id = ?',
                'DELETE FROM student_exams WHERE mentor_id = ? OR student_id IN (SELECT id FROM students WHERE mentor_id = ?)',
                'DELETE FROM mentor_timetable WHERE mentor_id = ?',
                'DELETE FROM notifications WHERE user_id = ?',
                'DELETE FROM live_class_feedbacks WHERE faculty_id = ?',
                'DELETE FROM student_verification WHERE mentor_head_id = ?',
                'DELETE FROM activity_logs WHERE user_id = ?',
                'DELETE FROM user_activity_logs WHERE user_id = ?',
                'DELETE FROM admin_actions WHERE user_id = ?'
            ];

            for (const query of cleanupQueries) {
                try {
                    const params = query.includes('OR') ? [id, id] : [id];
                    await db.query(query, params);
                } catch (e) {
                    // Silently ignore schema mismatches
                }
            }

            // Final User Delete
            await db.query('DELETE FROM users WHERE id = ?', [id]);
            
            try {
                await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [
                    `<b>System Action:</b> Staff member (ID: ${id}) was permanently removed.`
                ]);
            } catch (e) {}
            
            res.status(200).json({ success: true, message: "Member and associated dependencies cleared successfully" });
        }
    } catch (error) {
        console.error("DELETE_USER_ERROR LOG:", error);
        res.status(500).json({ 
            success: false, 
            message: "Database Conflict: " + error.message, 
            error: error.message 
        });
    }
};

// @desc    Get all student logs
// @route   GET /api/admin/student-logs
const getAllStudentLogs = async (req, res) => {
    try {
        // Build query with filters if needed, but for now just get all
        const [rows] = await db.query(`
            SELECT logs.*, m.name as mentor_name, s.name as student_name
            FROM student_interaction_logs logs
            LEFT JOIN users m ON logs.mentor_id = m.id
            JOIN students s ON logs.student_id = s.id
            ORDER BY logs.created_at DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all faculty logs
// @route   GET /api/admin/faculty-logs
const getAllFacultyLogs = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT logs.*, m.name as mentor_name, s.name as student_name
            FROM faculty_interaction_logs logs
            LEFT JOIN users m ON logs.mentor_id = m.id
            JOIN students s ON logs.student_id = s.id
            ORDER BY logs.created_at DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Daily Mentor Head Report
// @route   GET /api/admin/mentor-head-report
const getDailyMentorHeadReport = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        // Fetch all active students to calculate remaining
        const [allStudents] = await db.query('SELECT id, name, registration_number FROM students WHERE status = "active"');
        const totalStudents = allStudents.length;

        // Fetch Mentor Heads
        const [mentorHeads] = await db.query(`
            SELECT id as mentor_head_id, name as mentor_head_name
            FROM users 
            WHERE role = 'mentor_head'
        `);

        const mappedData = [];

        for (const rh of mentorHeads) {
            // Get checked students for this mentor head today
            const [checkedRecords] = await db.query(`
                SELECT DISTINCT s.id, s.name, s.registration_number
                FROM student_verification v
                JOIN students s ON v.student_id = s.id
                WHERE v.mentor_head_id = ? AND v.date = ?
            `, [rh.mentor_head_id, targetDate]);

            // Calculate remaining
            const checkedIds = new Set(checkedRecords.map(s => s.id));
            const remainingRecords = allStudents.filter(s => !checkedIds.has(s.id));

            mappedData.push({
                mentorHeadId: rh.mentor_head_id,
                date: targetDate,
                mentorHeadName: rh.mentor_head_name,
                totalStudents: totalStudents,
                checkedToday: checkedRecords.length,
                remaining: remainingRecords.length,
                checkedStudents: checkedRecords,
                remainingStudents: remainingRecords
            });
        }

        res.status(200).json({
            success: true,
            data: mappedData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Admin Notifications
// @route   GET /api/admin/notifications
const getAdminNotifications = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 50');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark Notification as Read
// @route   PUT /api/admin/notifications/:id/read
const markNotificationRead = async (req, res) => {
    try {
        await db.query('UPDATE admin_notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Single Notification
// @route   DELETE /api/admin/notifications/:id
const deleteNotification = async (req, res) => {
    try {
        await db.query('DELETE FROM admin_notifications WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Clear All Notifications
// @route   DELETE /api/admin/notifications/clear-all
const clearAllNotifications = async (req, res) => {
    try {
        await db.query('DELETE FROM admin_notifications');
        res.status(200).json({ success: true, message: "All notifications cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Student
// @route   PUT /api/admin/students/:id
const updateStudentForAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, grade, subject, timetable, nextInstallment, status } = req.body;

        const [[oldStudent]] = await db.query('SELECT name FROM students WHERE id = ?', [id]);

        const [result] = await db.query(
            'UPDATE students SET name = ?, grade = ?, subject = ?, time_table = ?, next_installment_date = ?, status = ? WHERE id = ?',
            [name, grade, subject, timetable, nextInstallment, status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [
            `<b>Student Updated:</b> Profile of <b>${oldStudent?.name || id}</b> has been modified.`
        ]);
        res.status(200).json({ success: true, message: "Student updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Update User (Mentor, Faculty, etc.)
// @route   PUT /api/admin/users/:id
const updateUserForAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone_number, status, role } = req.body;

        const [[oldUser]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);

        const [result] = await db.query(
            'UPDATE users SET name = ?, email = ?, phone_number = ?, status = ?, role = ? WHERE id = ?',
            [name, email, phone_number, status, role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [
            `<b>Staff Updated:</b> ${role} <b>${oldUser?.name || id}</b> details were updated.`
        ]);
        res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get All Students
// @route   GET /api/admin/students
const getAllStudentsForAdmin = async (req, res) => {
    try {
        const { startDate, endDate, category, search, sortBy, mentor_id } = req.query;
        let sql = `
            SELECT 
                id, roll_number, registration_number, name, grade, course, hour, 
                mentor_name as mentor, faculty_name as faculty, 
                subject, time_table as timetable, 
                next_installment_date as nextInstallment, 
                status, onboarding_status, 
                attendance_percentage, performance_status,
                course_completed,
                created_at,
                mentor_id,
                badge
            FROM students WHERE 1=1
        `;
        let params = [];

        if (mentor_id) {
            sql += ' AND mentor_id = ?';
            params.push(mentor_id);
        }

        if (startDate) {
            sql += ' AND created_at >= ?';
            params.push(startDate);
        }
        if (endDate) {
            sql += ' AND created_at <= ?';
            params.push(endDate + ' 23:59:59');
        }

        if (category === 'Active Records') {
            sql += ' AND status = "active"';
        } else if (category === 'Archived Records') {
            sql += ' AND status IN ("inactive", "rejected", "completed")';
        }

        if (search) {
            sql += ' AND (name LIKE ? OR registration_number LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (sortBy === 'oldest') {
            sql += ' ORDER BY created_at ASC';
        } else {
            sql += ' ORDER BY created_at DESC';
        }

        const [rows] = await db.query(sql, params);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ========================================================
// ADMIN MANAGEMENT SECTION (SUPER ADMIN ONLY)
// ========================================================
// @desc    Get All Sub Admins
// @route   GET /api/admin/sub-admins
const getSubAdmins = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: "Access Denied. Admin authority required." });
        }

        // Check common timestamp column names
        const [tableInfo] = await db.query('SHOW COLUMNS FROM users');
        const hasCreatedAt = tableInfo.some(c => c.Field === 'createdAt');
        const hasCreatedAtSnake = tableInfo.some(c => c.Field === 'created_at');
        const timeColumn = hasCreatedAt ? 'createdAt' : (hasCreatedAtSnake ? 'created_at' : 'id');

        const [rows] = await db.query(
            `SELECT id, name, email, phone_number, status, isActive, permissions, ${timeColumn} as created_at FROM users WHERE role = "sub_admin"`
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("GET_SUB_ADMINS_ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch sub-admins: " + error.message });
    }
};

// @desc    Create Sub Admin
// @route   POST /api/admin/sub-admins
const createSubAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: "Access Denied. Authority insufficient." });
        }

        const { name, email, password, phone_number, status, permissions } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Name, Email and Password are required" });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone_number, role, status, isActive, createdBy, permissions) VALUES (?, ?, ?, ?, "sub_admin", ?, 1, ?, ?)',
            [name, email, hashedPassword, phone_number, status || 'active', req.user.id, permissions ? JSON.stringify(permissions) : null]
        );

        res.status(201).json({ success: true, message: "Sub Admin created successfully", id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Sub Admin
// @route   PUT /api/admin/sub-admins/:id
const updateSubAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: "Access Denied. Authority insufficient." });
        }

        const { id } = req.params;
        const { name, phone_number, status, password, permissions } = req.body;

        // Check if target is actually a sub_admin to prevent privilege escalation or modifying super_admin
        const [target] = await db.query('SELECT role FROM users WHERE id = ?', [id]);
        if (!target.length || target[0].role !== 'sub_admin') {
            return res.status(400).json({ success: false, message: "Invalid target. Only sub_admins can be managed here." });
        }

        let query = 'UPDATE users SET name = ?, phone_number = ?, status = ?, isActive = ?, permissions = ?';
        let params = [name, phone_number, status, status === 'active' ? 1 : 0, permissions ? JSON.stringify(permissions) : null];

        if (password) {
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);
        res.status(200).json({ success: true, message: "Sub Admin updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Sub Admin
// @route   DELETE /api/admin/sub-admins/:id
const deleteSubAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: "Access Denied. Authority insufficient." });
        }

        const { id } = req.params;

        // Protection: System must not allow deleting the ACTIVE main super admin via this route
        const [target] = await db.query('SELECT name, role, status FROM users WHERE id = ?', [id]);
        if (!target.length) return res.status(404).json({ success: false, message: "User not found" });
        
        const userRole = target[0].role;
        if (userRole === 'super_admin' && target[0].status === 'active') {
            return res.status(403).json({ success: false, message: "Active Super Admin cannot be deleted." });
        }

        // Handle sub-admin dependencies (they might have registered users or created tasks)
        await db.query('UPDATE users SET registeredBy = NULL WHERE registeredBy = ?', [id]);
        await db.query('UPDATE students SET registeredBy = NULL WHERE registeredBy = ?', [id]);
        await db.query('UPDATE tasks SET assigned_by = NULL WHERE assigned_by = ?', [id]);
        await db.query('UPDATE tasks SET assigned_to = NULL WHERE assigned_to = ?', [id]);

        await db.query('DELETE FROM users WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: "Sub Admin deleted successfully. Integrity maintained." });
    } catch (error) {
        console.error("DELETE_SUBADMIN_ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to delete sub-admin due to data dependency.", error: error.message });
    }
};

// @desc    Get All Mentors
// @route   GET /api/admin/mentors
const getAllMentorsForAdmin = async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        let whereClauses = ["u.role = 'mentor'", "u.status = 'active'"];
        let params = [];

        if (startDate) {
            whereClauses.push("u.createdAt >= ?");
            params.push(startDate);
        }
        if (endDate) {
            whereClauses.push("u.createdAt <= ?");
            params.push(endDate + ' 23:59:59');
        }

        if (category === 'Active Records') {
            whereClauses.push("u.status = 'active'");
        } else if (category === 'Archived Records') {
            whereClauses.push("u.status != 'active'");
        }

        const query = `
            SELECT 
                u.id, u.name, u.email, u.phone_number as phone, u.status, u.createdAt as created_at,
                (SELECT COUNT(*) FROM students s WHERE s.mentor_id = u.id AND s.status = 'active') as studentsCount,
                (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = u.id) as tasksAssigned,
                (SELECT COUNT(*) FROM tasks t WHERE t.assigned_to = u.id AND t.status = 'Completed') as completedTasks
            FROM users u
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY u.name ASC
        `;
        const [rows] = await db.query(query, params);
        const mappedData = rows.map(row => ({
            ...row,
            completionRate: row.tasksAssigned > 0 ? Math.round((row.completedTasks / row.tasksAssigned) * 100) : 0
        }));
        res.status(200).json({ success: true, count: mappedData.length, data: mappedData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Staff Members (Mentors, Heads, etc.)
// @route   GET /api/admin/staff
const getStaffMembers = async (req, res) => {
    try {
        const query = `
            SELECT id, name, email, phone_number as phone, role, status, createdAt as created_at
            FROM users
            WHERE role NOT IN ('student', 'sub_admin', 'super_admin') AND status = 'active'
            ORDER BY role ASC, name ASC
        `;
        const [rows] = await db.query(query);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Faculties
// @route   GET /api/admin/faculties
const getAllFacultiesForAdmin = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, u.name, u.email, u.phone_number as phone, u.status,
                (SELECT COUNT(*) FROM students s WHERE s.faculty_id = u.id AND s.status = 'active') as studentsUnder,
                (SELECT COUNT(DISTINCT s.mentor_id) FROM students s WHERE s.faculty_id = u.id AND s.mentor_id IS NOT NULL AND s.status = 'active') as mentorsUnder
            FROM users u
            WHERE u.role = 'faculty' AND u.status = 'active'
            ORDER BY u.name ASC
        `;
        const [rows] = await db.query(query);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminDashboardSummary,
    getUsers,
    getUserById,
    approveUser,
    blockUser,
    deleteUser,
    getAllStudentLogs,
    getAllFacultyLogs,
    getPendingUsers,
    rejectUser,
    getDailyMentorHeadReport,
    getAdminNotifications,
    markNotificationRead,
    deleteNotification,
    clearAllNotifications,
    getAllStudentsForAdmin,
    getAllMentorsForAdmin,
    getAllFacultiesForAdmin,
    getStaffMembers,
    getSubAdmins,
    createSubAdmin,
    updateSubAdmin,
    deleteSubAdmin,
    updateStudentForAdmin,
    updateUserForAdmin,
    // @desc    Get exam analytics for graphs
    getExamAnalytics: async (req, res) => {
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
    },
    // @desc    Get mentor student distribution
    // @route   GET /api/admin/mentor-distribution
    getMentorDistribution: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                    u.name as mentor_name,
                    (SELECT COUNT(*) FROM students s WHERE s.mentor_id = u.id AND s.status = 'active') as student_count
                FROM users u
                WHERE u.role = 'mentor' AND u.status = 'active'
                HAVING student_count > 0
                ORDER BY student_count DESC
            `);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // @desc    Get task performance analytics
    // @route   GET /api/admin/task-analytics
    getTaskAnalytics: async (req, res) => {
        try {
            const { range } = req.query;
            let daysCount = 7; // Default

            const mapping = {
                'today': 1,
                'yesterday': 2,
                'last3': 3,
                'last7': 7,
                'this_week': 7,
                'last_week': 7,
                'last14': 14,
                'last30': 30,
                'this_month': 30,
                'last_month': 30,
                'last60': 60,
                'last90': 90
            };

            if (mapping[range]) {
                daysCount = mapping[range];
            }

            // Create helper to format date as YYYY-MM-DD in local time
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(today);
            startDate.setDate(today.getDate() - (daysCount - 1));

            console.log(`ANALYTICS_DEBUG: range=${range}, daysCount=${daysCount}, startDate=${startDate.toISOString()}, today=${today.toISOString()}`);

            // Query DB
            const [rows] = await db.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m-%d') as date_label,
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN (status = 'Completed' OR status = 'Success') THEN 1 ELSE 0 END) as completed_tasks
                FROM tasks
                WHERE created_at >= ?
                GROUP BY date_label
                ORDER BY date_label ASC
            `, [startDate]);

            // Create a lookup map
            const dbDataMap = {};
            rows.forEach(row => {
                dbDataMap[row.date_label] = {
                    total_tasks: parseInt(row.total_tasks) || 0,
                    completed_tasks: parseInt(row.completed_tasks) || 0
                };
            });

            // Generate full date range
            const fullRangeData = [];
            let currentDate = new Date(startDate);

            while (currentDate <= today) {
                const dateStr = formatDate(currentDate);
                const dayData = dbDataMap[dateStr] || { total_tasks: 0, completed_tasks: 0 };

                // Always use Month Date labels as per user request
                const name = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                fullRangeData.push({
                    date: dateStr,
                    name: name,
                    tasks: dayData.total_tasks,
                    completed: dayData.completed_tasks
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }

            console.log(`ANALYTICS_DEBUG: returning ${fullRangeData.length} days`);
            res.status(200).json({ success: true, data: fullRangeData });
        } catch (error) {
            console.error("TASK_ANALYTICS_ERROR:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    },
    // @desc    Get currently running sessions across the platform
    // @route   GET /api/admin/live-monitoring
    getLiveMonitoring: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                    fs.id, fs.topic, fs.date, fs.start_time, fs.end_time, fs.status,
                    u.name as faculty_name,
                    s.name as student_name,
                    s.meeting_link,
                    s.registration_number,
                    m.name as mentor_name
                FROM faculty_sessions fs
                JOIN users u ON fs.faculty_id = u.id
                JOIN session_attendance sa ON fs.id = sa.session_id
                JOIN students s ON sa.student_id = s.id
                LEFT JOIN users m ON s.mentor_id = m.id
                WHERE fs.date = CURDATE()
                ORDER BY fs.start_time ASC
            `);
            res.status(200).json({ success: true, count: rows.length, data: rows });
        } catch (error) {
            console.error("LIVE_MONITORING_ERROR:", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
