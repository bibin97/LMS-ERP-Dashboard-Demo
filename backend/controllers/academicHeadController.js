const db = require('../config/db');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

// @desc    Get dashboard metrics and today's schedule
// @route   GET /api/academic-head/dashboard
const getExamAnalytics = async (req, res) => {
    try {
        const { student_id } = req.query;
        let query = '';
        let params = [];

        if (student_id) {
            query = `
                SELECT 
                    milestone_session as subject,
                    CAST(score AS DECIMAL(10,2)) as percentage
                FROM student_exams 
                WHERE status = 'Completed' AND student_id = ?
            `;
            params.push(student_id);
        } else {
            query = `
                SELECT 
                    milestone_session as subject,
                    AVG(CAST(score AS DECIMAL(10,2))) as percentage
                FROM student_exams 
                WHERE status = 'Completed'
                GROUP BY milestone_session
            `;
        }

        const [stats] = await db.query(query, params);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Basic Stats
        const [[{ totalStudents }]] = await db.query('SELECT COUNT(*) as totalStudents FROM students WHERE status = "active"');
        const [[{ totalFaculties }]] = await db.query('SELECT COUNT(*) as totalFaculties FROM users WHERE role = "faculty" AND status = "active"');
        const [[{ totalMentors }]] = await db.query('SELECT COUNT(*) as totalMentors FROM users WHERE role = "mentor" AND status = "active"');

        // 2. Today's Schedule
        const [schedule] = await db.query(`
            SELECT 
                tt.id, tt.start_time, tt.end_time, tt.chapter, tt.status,
                s.name as student_name, s.subject,
                u.name as faculty_name
            FROM mentor_timetable tt
            JOIN students s ON tt.student_id = s.id
            LEFT JOIN users u ON s.faculty_id = u.id
            WHERE tt.date = ?
            ORDER BY tt.start_time ASC
        `, [today]);

        // 3. Activity Feed (Merged Intelligence from all logs)
        const [activityFeed] = await db.query(`
            (SELECT 'Student Report' as type, r.remarks as details, s.name as student_name, u.name as origin_name, r.created_at as date
             FROM student_reports r 
             JOIN students s ON r.student_id = s.id 
             JOIN users u ON r.faculty_id = u.id)
            UNION ALL
            (SELECT 'Student Interaction' as type, sil.mentor_notes as details, s.name as student_name, u.name as origin_name, sil.created_at as date
             FROM student_interaction_logs sil
             JOIN students s ON sil.student_id = s.id
             JOIN users u ON sil.mentor_id = u.id)
            UNION ALL
            (SELECT 'Faculty Interaction' as type, fil.notes as details, s.name as student_name, u.name as origin_name, fil.created_at as date
             FROM faculty_interaction_logs fil
             JOIN students s ON fil.student_id = s.id
             JOIN users u ON fil.mentor_id = u.id)
            ORDER BY date DESC
            LIMIT 10
        `);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalStudents,
                    totalFaculties,
                    totalMentors,
                    todaySessions: schedule.length
                },
                schedule,
                activityFeed
            }
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all faculty session logs and reports
// @route   GET /api/academic-head/faculty-logs
const getAllFacultyActivity = async (req, res) => {
    try {
        // 1. Faculty Sessions
        const [sessions] = await db.query(`
            SELECT s.*, u.name as faculty_name 
            FROM faculty_sessions s
            JOIN users u ON s.faculty_id = u.id
            ORDER BY s.date DESC
        `);

        // 2. Student Reports (Faculty intelligence logs)
        const [reports] = await db.query(`
            SELECT r.*, s.name as student_name, u.name as faculty_name
            FROM student_reports r
            JOIN students s ON r.student_id = s.id
            JOIN users u ON r.faculty_id = u.id
            ORDER BY r.created_at DESC
        `);

        res.status(200).json({
            success: true,
            data: {
                sessions,
                reports
            }
        });
    } catch (error) {
        console.error('Error in getAllFacultyActivity:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get dropdown data for student registration
// @route   GET /api/academic-head/dropdowns
const getDropdownData = async (req, res) => {
    try {
        const [mentors] = await db.query('SELECT id, name FROM users WHERE role = "mentor" AND status = "active"');
        const [mentorHeads] = await db.query('SELECT id, name FROM users WHERE role = "mentor_head" AND status = "active"');
        const [faculties] = await db.query('SELECT id, name FROM users WHERE role = "faculty" AND status = "active"');
        res.status(200).json({
            success: true,
            data: {
                mentors,
                mentorHeads,
                faculties
            }
        });
    } catch (error) {
        console.error('Error in getDropdownData:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Register a new student
// @route   POST /api/academic-head/register-student
const registerStudent = async (req, res) => {
    try {
        const {
            name, email, password, grade, mentorId, course, hour, nextInstallmentDate, admissionType,
            registrationNumber, meetingLink, facultyHourlyRate, selectedSubjects
        } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "User session invalid. Please re-login." });
        }

        // 1. Create User account for student first (Only if password/email provided or using defaults)
        const salt = await bcrypt.genSalt(10);
        const passwordToHash = (password && password.trim() !== '') ? password.trim() : "student123";
        const hashedPassword = await bcrypt.hash(passwordToHash, salt);

        // Check if user already exists (ONLY if email is provided)
        if (email && email.trim() !== '') {
            const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                return res.status(400).json({ success: false, message: "Email already registered as a user/student." });
            }
        }

        const [userResult] = await db.query(
            'INSERT INTO users (name, email, password, role, status, isApproved, isActive, registeredBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, (email && email.trim() !== '') ? email : null, hashedPassword, 'student', 'active', 1, 1, req.user.id]
        );
        const userId = userResult.insertId;

        // 2. Fetch names for legacy columns
        let mentorName = null;
        let primaryFacultyId = null;
        let primaryFacultyName = null;
        let primarySubject = null;

        if (mentorId) {
            const [mRows] = await db.query('SELECT name FROM users WHERE id = ?', [mentorId]);
            if (mRows.length) mentorName = mRows[0].name;
        }

        if (selectedSubjects && selectedSubjects.length > 0) {
            primaryFacultyId = selectedSubjects[0].facultyId;
            primaryFacultyName = selectedSubjects[0].facultyName;
            primarySubject = selectedSubjects[0].subject;
        }

        const onboardingStatus = admissionType === 'existing' ? 'completed' : 'pending';

        const enrollmentType = req.body.enrollmentType || null;
        const badge = enrollmentType === 'Mentorship' ? 'Gold' : 
                      enrollmentType === 'Tuition' ? 'Silver' : 
                      enrollmentType === 'Mentorship and Tuition' ? 'Diamond' : null;

        const query = `
            INSERT INTO students (
                name, email, password, user_id, grade, subject, course, hour, 
                mentor_id, mentor_name, faculty_id, faculty_name, next_installment_date,
                time_table, status, onboarding_status, isApproved, registeredBy,
                registration_number, meeting_link, faculty_hourly_rate, subjects_json, enrollment_type, badge
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [studentResult] = await db.query(query, [
            name, email, hashedPassword, userId, grade, primarySubject, course, hour,
            mentorId || null, mentorName, primaryFacultyId || null, primaryFacultyName, nextInstallmentDate || null,
            JSON.stringify({}), // Empty timetable initially
            'active', // Set to active since user is active
            onboardingStatus,
            1, // Auto approved for consistency with user login
            req.user.id, // Registering user ID
            registrationNumber || null,
            meetingLink || null,
            facultyHourlyRate || 0,
            JSON.stringify(selectedSubjects || []),
            enrollmentType,
            badge
        ]);

        const studentId = studentResult.insertId;

        // Schedule first session for each faculty if mentor exists
        if (mentorId && selectedSubjects && selectedSubjects.length > 0) {
            for (const sub of selectedSubjects) {
                await db.query(`
                    INSERT INTO mentor_timetable (
                        mentor_id, student_id, session_number, date, status, 
                        chapter, start_time, end_time, duration, session_type
                    ) VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?)
                `, [
                    mentorId, studentId, 1, 'Scheduled',
                    `Initial Session: ${sub.subject}`, '10:00', '11:00', '1h 0m', 'Regular Class'
                ]);
            }
        }

        // Notify Admin
        const msg = `<b>Academic Update:</b> <span style="color:#008080">${req.user.name}</span> registered a new student <b>${name}</b> for ${course}. <span style="color:#f59e0b">(Pending Approval)</span>`;
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [msg]);

        res.status(201).json({ success: true, message: "Student registered successfully. Pending Admin approval." });
    } catch (error) {
        console.error('Error in registerStudent:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Register a new faculty (Signup style)
// @route   POST /api/academic-head/register-faculty
const registerFaculty = async (req, res) => {
    try {
        const { name, email, phone_number, place, password } = req.body;
        const requesterId = req.user?.id;

        console.log(`[FACULTY REG] Attempting registration: ${email} (By Admin ID: ${requesterId})`);

        if (!requesterId) {
            return res.status(401).json({ success: false, message: "User session invalid. Please re-login." });
        }

        const salt = await bcrypt.genSalt(10);
        // Explicit password priority: Form > Phone > Default
        const passwordToHash = (password && password.trim() !== '') ? password.trim() : (phone_number || "faculty123");
        const hashedPassword = await bcrypt.hash(passwordToHash, salt);

        console.log(`[FACULTY REG] Password source applied. Identifier to use for login: ${email || phone_number}`);

        // Faculty registration starts as ACTIVE when created by Academic Head
        // They are auto-approved to allow immediate assignment to students.
        const userId = await User.create({
            name,
            email: email?.trim() || null,
            phone_number: phone_number?.trim() || null,
            place,
            password: hashedPassword,
            role: 'faculty',
            status: 'pending',
            isApproved: 0,
            registeredBy: requesterId
        });

        // Notify Admin
        const msg = `<b>Staff Onboarding:</b> <span style="color:#008080">${req.user.name}</span> added and activated new faculty <b>${name}</b>.`;
        await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [msg]);

        console.log(`[FACULTY REG] SUCCESS! New Faculty ID: ${userId} | Status: ACTIVE`);
        res.status(201).json({
            success: true,
            message: "Faculty account created and activated successfully.",
            userId
        });
    } catch (error) {
        console.error('[FACULTY REG] CRITICAL ERROR:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: "Email or Phone already exists." });
        }
        res.status(500).json({ success: false, message: "Internal server error during registration" });
    }
};

// @desc    Get all student interaction logs (Mentor logs)
// @route   GET /api/academic-head/student-interaction-logs
const getStudentInteractionLogs = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT logs.*, s.name as student_name, u.name as mentor_name
            FROM student_interaction_logs logs
            JOIN students s ON logs.student_id = s.id
            JOIN users u ON logs.mentor_id = u.id
            ORDER BY logs.created_at DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Error in getStudentInteractionLogs:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all faculty interaction logs (Mentor & Faculty logs)
// @route   GET /api/academic-head/faculty-interaction-logs
const getFacultyInteractionLogs = async (req, res) => {
    try {
        // 1. Logs from Mentors about Faculty Sessions
        const [mentorLogs] = await db.query(`
            SELECT logs.*, s.name as student_name, u.name as mentor_name, f.name as faculty_name,
            'mentor' as log_source
            FROM faculty_interaction_logs logs
            JOIN students s ON logs.student_id = s.id
            JOIN users u ON logs.mentor_id = u.id
            LEFT JOIN users f ON logs.faculty_id = f.id
            ORDER BY logs.created_at DESC
        `);

        // 2. Session reports from Faculty
        const [facultyLogs] = await db.query(`
            SELECT s.*, u.name as faculty_name,
            'faculty' as log_source
            FROM faculty_sessions s
            JOIN users u ON s.faculty_id = u.id
            WHERE s.status = 'Completed'
            ORDER BY s.date DESC
        `);

        res.status(200).json({
            success: true,
            data: {
                mentorLogs,
                facultyLogs
            }
        });
    } catch (error) {
        console.error('Error in getFacultyInteractionLogs:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get consolidated actions (Milestones & Daily Logs)
// @route   GET /api/academic-head/actions
const getAcademicActions = async (req, res) => {
    try {
        // 1. Get Exam Milestones (Due/Pending)
        // Similar to mentor logic but for all students
        const [students] = await db.query('SELECT id, name, mentor_id FROM students WHERE status = "active"');

        let pendingMilestones = [];

        for (const student of students) {
            const [rows] = await db.query(
                'SELECT MAX(session_number) as current_max FROM mentor_timetable WHERE student_id = ? AND status != "Cancelled"',
                [student.id]
            );

            const currentMax = rows[0].current_max || 0;

            for (let milestone = 5; milestone <= currentMax; milestone += 5) {
                const [existing] = await db.query(
                    'SELECT status, score, chapter, portions, exam_type, scheduled_date FROM student_exams WHERE student_id = ? AND milestone_session = ?',
                    [student.id, milestone]
                );

                if (existing.length === 0 || existing[0].status !== 'Completed') {
                    pendingMilestones.push({
                        student_id: student.id,
                        student_name: student.name,
                        milestone: milestone,
                        current_sessions: currentMax,
                        status: existing.length > 0 ? existing[0].status : 'Pending',
                        chapter: existing.length > 0 ? existing[0].chapter : null,
                        portions: existing.length > 0 ? existing[0].portions : null,
                        exam_type: existing.length > 0 ? existing[0].exam_type : 'MCQ',
                        scheduled_date: existing.length > 0 ? existing[0].scheduled_date : null,
                        mentor_id: student.mentor_id
                    });
                }
            }
        }

        // 2. Today's Faculty Activity
        const today = new Date().toISOString().split('T')[0];
        const [dailyLogs] = await db.query(`
            SELECT fs.*, fs.topic as chapter, u.name as faculty_name
            FROM faculty_sessions fs
            JOIN users u ON fs.faculty_id = u.id
            WHERE DATE(fs.date) = ?
            ORDER BY fs.created_at DESC
        `, [today]);

        // 3. Mentors responsible for these milestones
        const mentorIds = [...new Set(pendingMilestones.map(m => m.mentor_id))].filter(Boolean);
        let mentors = {};
        if (mentorIds.length > 0) {
            const [mentorRows] = await db.query('SELECT id, name FROM users WHERE id IN (?)', [mentorIds]);
            mentorRows.forEach(m => mentors[m.id] = m.name);
        }

        const enrichedMilestones = pendingMilestones.map(m => ({
            ...m,
            mentor_name: mentors[m.mentor_id] || 'Unassigned'
        }));

        res.status(200).json({
            success: true,
            data: {
                milestones: enrichedMilestones,
                dailyLogs: dailyLogs
            }
        });
    } catch (error) {
        console.error('Error in getAcademicActions:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get Daily Faculty Checks (for Academic Head)
// @route   GET /api/academic-head/daily-faculty-checks
const getDailyFacultyChecks = async (req, res) => {
    try {
        const query = `
            SELECT 
                fs.id as session_id,
                fs.date,
                fs.topic as chapter,
                fs.topic as topics_covered,
                u.name as faculty_name,
                u.id as faculty_id,
                s.name as student_name,
                s.id as student_id,
                (SELECT COUNT(*) FROM faculty_verification WHERE session_id = fs.id) AS check_count,
                (SELECT COUNT(DISTINCT fv.session_id) 
                 FROM faculty_verification fv
                 JOIN session_attendance sa2 ON fv.session_id = sa2.session_id
                 WHERE sa2.student_id = s.id) as total_verified_for_student
            FROM faculty_sessions fs
            JOIN users u ON fs.faculty_id = u.id
            JOIN session_attendance sa ON fs.id = sa.session_id
            JOIN students s ON sa.student_id = s.id
            WHERE fs.status = 'Completed'
            ORDER BY fs.date DESC
        `;
        const [sessions] = await db.query(query);
        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error in getDailyFacultyChecks:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a manual check marker for faculty session
// @route   POST /api/academic-head/sessions/:sessionId/check
const checkFacultySessionToday = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const academicHeadId = req.user.id;
        const today = new Date().toISOString().split('T')[0];

        await db.query(
            'INSERT INTO faculty_verification (session_id, academic_head_id, date) VALUES (?, ?, ?)',
            [sessionId, academicHeadId, today]
        );

        res.status(200).json({ success: true, message: 'Faculty session audit check added' });
    } catch (error) {
        console.error('Error in checkFacultySessionToday:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove the latest manual check marker for faculty session
// @route   DELETE /api/academic-head/sessions/:sessionId/uncheck
const uncheckFacultySession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        await db.query(`
            DELETE FROM faculty_verification 
            WHERE id = (
                SELECT id FROM (
                    SELECT id FROM faculty_verification 
                    WHERE session_id = ? 
                    ORDER BY id DESC LIMIT 1
                ) as t
            )
        `, [sessionId]);

        res.status(200).json({ success: true, message: 'Latest faculty session check removed' });
    } catch (error) {
        console.error('Error in uncheckFacultySession:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all faculties with their students and schedules
// @route   GET /api/academic-head/faculties
const getFacultyDirectory = async (req, res) => {
    try {
        const { sortBy, startDate, endDate } = req.query;
        
        let query = `
            SELECT id, name, email, phone_number, status, place, createdAt as created_at 
            FROM users 
            WHERE role = "faculty" 
        `;

        if (sortBy === 'newest') {
            query += ' ORDER BY createdAt DESC';
        } else if (sortBy === 'oldest') {
            query += ' ORDER BY createdAt ASC';
        } else {
            query += ' ORDER BY name ASC';
        }

        const [faculties] = await db.query(query);

        const today = new Date().toISOString().split('T')[0];
        const rangeStart = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]; // Default: Month start
        const rangeEnd = endDate || today;

        const enrichedFaculties = await Promise.all(faculties.map(async (faculty) => {
            // Student stats
            const [[{ studentCount }]] = await db.query(
                'SELECT COUNT(*) as studentCount FROM students WHERE faculty_id = ? AND status = "active"',
                [faculty.id]
            );

            const [assignedStudents] = await db.query(
                'SELECT id, name, grade, subject FROM students WHERE faculty_id = ? AND status = "active"',
                [faculty.id]
            );

            // Time analytics (Total hours taken in range)
            const [sessionsInRange] = await db.query(`
                SELECT duration FROM faculty_sessions 
                WHERE faculty_id = ? AND date BETWEEN ? AND ? AND status = 'Completed'
            `, [faculty.id, rangeStart, rangeEnd]);

            let totalMinutes = 0;
            sessionsInRange.forEach(s => {
                const match = s.duration.match(/(\d+)h\s*(\d+)m/);
                if (match) {
                    totalMinutes += (parseInt(match[1]) * 60) + parseInt(match[2]);
                } else {
                    const hMatch = s.duration.match(/(\d+)h/);
                    if (hMatch) totalMinutes += parseInt(hMatch[1]) * 60;
                    const mMatch = s.duration.match(/(\d+)m/);
                    if (mMatch) totalMinutes += parseInt(mMatch[1]);
                }
            });
            const totalHours = (totalMinutes / 60).toFixed(1);

            const [todaySchedule] = await db.query(`
                SELECT fs.*, 
                (SELECT GROUP_CONCAT(st.name) 
                 FROM session_attendance sa 
                 JOIN students st ON sa.student_id = st.id 
                 WHERE sa.session_id = fs.id) as students_present
                FROM faculty_sessions fs
                WHERE fs.faculty_id = ? AND DATE(fs.date) = ?
                ORDER BY fs.start_time ASC
            `, [faculty.id, today]);

            return {
                ...faculty,
                studentCount,
                totalHours: parseFloat(totalHours),
                assignedStudents,
                todaySchedule
            };
        }));

        // Secondary sorting for performance labels
        let finalData = enrichedFaculties;
        if (sortBy === 'most_students') {
            finalData = [...enrichedFaculties].sort((a, b) => b.studentCount - a.studentCount);
        } else if (sortBy === 'most_hours') {
            finalData = [...enrichedFaculties].sort((a, b) => b.totalHours - a.totalHours);
        }

        res.status(200).json({ 
            success: true, 
            count: finalData.length, 
            data: finalData,
            range: { start: rangeStart, end: rangeEnd }
        });
    } catch (error) {
        console.error('Error in getFacultyDirectory:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get all academic documents
// @route   GET /api/academic-head/documents
const getAcademicDocuments = async (req, res) => {
    try {
        const [documents] = await db.query(`
            SELECT d.*, u.name as uploaded_by_name 
            FROM academic_documents d
            LEFT JOIN users u ON d.uploaded_by = u.id
            ORDER BY d.created_at DESC
        `);
        res.status(200).json({ success: true, data: documents });
    } catch (error) {
        console.error('Error in getAcademicDocuments:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Upload an academic document
// @route   POST /api/academic-head/documents
const uploadAcademicDocument = async (req, res) => {
    try {
        const { title, description, file_url, category } = req.body;
        const uploaded_by = req.user.id;

        if (!title || !file_url) {
            return res.status(400).json({ success: false, message: "Title and File URL are required" });
        }

        await db.query(`
            INSERT INTO academic_documents (title, description, file_url, uploaded_by, category)
            VALUES (?, ?, ?, ?, ?)
        `, [title, description, file_url, uploaded_by, category || 'General']);

        res.status(201).json({ success: true, message: "Document uploaded successfully" });
    } catch (error) {
        console.error('Error in uploadAcademicDocument:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Delete an academic document
// @route   DELETE /api/academic-head/documents/:id
const deleteAcademicDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM academic_documents WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: "Document deleted successfully" });
    } catch (error) {
        console.error('Error in deleteAcademicDocument:', error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// @desc    Get Live Class Evaluations
// @route   GET /api/academic-head/live-class-evaluations
const getLiveClassEvaluations = async (req, res) => {
    try {
        const [evals] = await db.query(`
            SELECT e.*, uf.name as faculty_name 
            FROM live_class_feedbacks e
            JOIN users uf ON e.faculty_id = uf.id
            ORDER BY e.created_at DESC
        `);
        res.status(200).json({ success: true, data: evals });
    } catch (error) {
        console.error('Error fetching live class evaluations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit Live Class Evaluation
// @route   POST /api/academic-head/live-class-evaluations
const submitLiveClassEvaluation = async (req, res) => {
    try {
        const { 
            faculty_id, student_id, joined_class, faculty_active, interactive, 
            faculty_camera_on, student_camera_on, remarks, proof_url, class_date,
            energy_level, screen_sharing, faculty_background, student_interaction_level, check_method
        } = req.body;
        const academic_head_id = req.user.id;

        await db.query(`
            INSERT INTO live_class_feedbacks (
                academic_head_id, faculty_id, student_id, joined_class, faculty_active, 
                interactive, faculty_camera_on, student_camera_on, remarks, proof_url, 
                class_date, energy_level, screen_sharing, faculty_background, 
                student_interaction_level, check_method
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            academic_head_id, faculty_id, student_id || null, joined_class || false, faculty_active || false,
            interactive || false, faculty_camera_on || false, student_camera_on || false, remarks, proof_url,
            class_date, energy_level || 0, screen_sharing || false, faculty_background || false,
            student_interaction_level || 0, check_method || 'Direct'
        ]);

        res.status(201).json({ success: true, message: 'Live class evaluation submitted successfully' });
    } catch (error) {
        console.error('Error submitting live class evaluation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get pending faculty interaction logs for verification
// @route   GET /api/academic-head/faculty-logs-pending
const getPendingFacultyLogs = async (req, res) => {
    try {
        const [logs] = await db.query(`
            SELECT f.*, u.name as faculty_name, s.name as student_name
            FROM faculty_interaction_logs f
            LEFT JOIN users u ON f.faculty_id = u.id
            LEFT JOIN students s ON f.student_id = s.id
            ORDER BY f.created_at DESC
        `);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching pending faculty logs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Faculty Interaction Log
// @route   PUT /api/academic-head/faculty-logs/:id/verify
const verifyFacultyLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { verification_status, verification_remarks } = req.body;
        const verified_by = req.user.id;

        await db.query(`
            UPDATE faculty_interaction_logs
            SET verification_status = ?, verification_remarks = ?, verified_by = ?
            WHERE id = ?
        `, [verification_status, verification_remarks, verified_by, id]);

        res.status(200).json({ success: true, message: 'Log verified successfully' });
    } catch (error) {
        console.error('Error verifying faculty log:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Set exam portions and date (Academic Head)
// @route   POST /api/academic-head/exams/plan
const saveExamPlan = async (req, res) => {
    try {
        const { student_id, milestone, chapter, portions, exam_type, scheduled_date, mentor_id } = req.body;

        if (!student_id || !milestone || !portions || !scheduled_date) {
            return res.status(400).json({ success: false, message: "Portions and Scheduled Date are required" });
        }

        await db.query(`
            INSERT INTO student_exams (student_id, mentor_id, milestone_session, chapter, portions, exam_type, scheduled_date, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
            ON DUPLICATE KEY UPDATE 
                chapter = VALUES(chapter),
                portions = VALUES(portions), 
                exam_type = VALUES(exam_type),
                scheduled_date = VALUES(scheduled_date),
                mentor_id = VALUES(mentor_id)
        `, [student_id, mentor_id, milestone, chapter, portions, exam_type, scheduled_date]);

        res.status(200).json({ success: true, message: "Exam plan saved and synced with Mentor" });
    } catch (error) {
        console.error('Error in saveExamPlan:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getExamAnalytics,
    saveExamPlan,
    getDropdownData,
    registerStudent,
    registerFaculty,
    getDashboardStats,
    getAllFacultyActivity,
    getStudentInteractionLogs,
    getFacultyInteractionLogs,
    getAcademicActions,
    getDailyFacultyChecks,
    checkFacultySessionToday,
    uncheckFacultySession,
    getFacultyDirectory,
    getAcademicDocuments,
    uploadAcademicDocument,
    deleteAcademicDocument,
    getLiveClassEvaluations,
    submitLiveClassEvaluation,
    getPendingFacultyLogs,
    verifyFacultyLog,
    // New Edit/Delete functionalities
    editFaculty: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone_number, place } = req.body;
            const [[user]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
            await db.query('UPDATE users SET name = ?, email = ?, phone_number = ?, place = ? WHERE id = ?', [name, email, phone_number, place, id]);
            await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Academic Head (${req.user.name}) edited faculty: ${user.name}`]);
            res.status(200).json({ success: true, message: 'Faculty updated' });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    deleteFaculty: async (req, res) => {
        try {
            const { id } = req.params;
            const [[user]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
            await db.query('DELETE FROM users WHERE id = ?', [id]);
            await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Academic Head (${req.user.name}) deleted faculty: ${user.name}`]);
            res.status(200).json({ success: true, message: 'Faculty deleted' });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    editStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, grade, subject, course, email, meetingLink, meeting_link, password } = req.body;
            const finalMeetingLink = meetingLink || meeting_link;
            
            const [[student]] = await db.query('SELECT name, user_id FROM students WHERE id = ?', [id]);
            if (!student) return res.status(404).json({ success: false, message: "Student not found" });

            // Update Students table
            await db.query(
                'UPDATE students SET name = ?, grade = ?, subject = ?, course = ?, email = ?, meeting_link = ? WHERE id = ?', 
                [name, grade, subject, course, email || null, finalMeetingLink || null, id]
            );

            // Update linked Users table
            if (student.user_id) {
                let userUpdateQuery = 'UPDATE users SET name = ?, email = ?';
                let userParams = [name, email || null];

                if (password && password.trim() !== '') {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    userUpdateQuery += ', password = ?';
                    userParams.push(hashedPassword);
                }

                userUpdateQuery += ' WHERE id = ?';
                userParams.push(student.user_id);
                await db.query(userUpdateQuery, userParams);
            }

            await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Academic Head (${req.user.name}) updated student profile for: ${student.name}`]);
            res.status(200).json({ success: true, message: 'Student profile updated successfully' });
        } catch (error) { 
            console.error("EDIT_STUDENT_ERROR:", error);
            res.status(500).json({ success: false, message: error.message }); 
        }
    },
    deleteStudent: async (req, res) => {
        try {
            const { id } = req.params;
            const [[student]] = await db.query('SELECT name FROM students WHERE id = ?', [id]);
            await db.query('DELETE FROM students WHERE id = ?', [id]);
            await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Academic Head (${req.user.name}) deleted student: ${student.name}`]);
            res.status(200).json({ success: true, message: 'Student deleted' });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    getStudents: async (req, res) => {
        try {
            const { mentor_id, search, sortBy } = req.query;
            let query = `
                SELECT s.*, u_m.name as mentor_name, u_f.name as faculty_name,
                (SELECT AVG(CAST(score AS DECIMAL(10,2))) FROM student_exams WHERE student_id = s.id AND status = 'Completed') as avg_score
                FROM students s
                LEFT JOIN users u_m ON s.mentor_id = u_m.id
                LEFT JOIN users u_f ON s.faculty_id = u_f.id
                WHERE 1=1
            `;
            const params = [];

            if (mentor_id) {
                query += ' AND s.mentor_id = ?';
                params.push(mentor_id);
            }

            if (search) {
                query += ' AND (s.name LIKE ? OR s.registration_number LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            if (sortBy === 'oldest') {
                query += ' ORDER BY s.created_at ASC';
            } else {
                query += ' ORDER BY s.created_at DESC';
            }

            const [rows] = await db.query(query, params);

            // Add performance label logic
            const enrichedRows = rows.map(student => {
                const score = parseFloat(student.avg_score) || 0;
                let performance = 'N/A';
                if (score >= 90) performance = 'Excellent';
                else if (score >= 75) performance = 'Very Good';
                else if (score >= 60) performance = 'Good';
                else if (score >= 45) performance = 'Average';
                else if (score > 0) performance = 'Needs Improvement';

                return { ...student, performance, avg_score: score.toFixed(2) };
            });

            res.status(200).json({ success: true, data: enrichedRows });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    getMentors: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT u.id, u.name, u.email, u.phone_number, u.place, u.status, u.createdAt,
                (SELECT COUNT(*) FROM students WHERE mentor_id = u.id) as studentCount
                FROM users u
                WHERE u.role = 'mentor'
                ORDER BY u.name ASC
            `);
            res.status(200).json({ success: true, data: rows });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    editMentor: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone_number, place } = req.body;
            const [[user]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
            await db.query('UPDATE users SET name = ?, email = ?, phone_number = ?, place = ? WHERE id = ?', [name, email, phone_number, place, id]);
            await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Academic Head (${req.user.name}) edited mentor: ${user.name}`]);
            res.status(200).json({ success: true, message: 'Mentor profile updated' });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    deleteMentor: async (req, res) => {
        try {
            const { id } = req.params;
            const [[user]] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
            await db.query('DELETE FROM users WHERE id = ?', [id]);
            await db.query('INSERT INTO admin_notifications (message) VALUES (?)', [`Academic Head (${req.user.name}) deleted mentor: ${user.name}`]);
            res.status(200).json({ success: true, message: 'Mentor profile purged' });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
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



