const Attendance = require('../models/Attendance');

// @desc    Mark attendance
const markAttendance = async (req, res) => {
    try {
        const { session_id, attendance_data } = req.body;
        
        const operations = attendance_data.map(item => ({
            updateOne: {
                filter: { session_id, student_id: item.student_id },
                update: { status: item.status, marked_by: req.user.id },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);
        res.status(200).json({ success: true, message: "Attendance synchronized" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get stats for current student
const getMyAttendanceStats = async (req, res) => {
    try {
        const student_id = req.user.id;
        const records = await Attendance.find({ student_id });
        
        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: { total_sessions: total, present_count: present, attendance_percentage: percentage }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { markAttendance, getMyAttendanceStats };
