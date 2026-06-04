const Student = require('../models/Student');
const DailyUpdate = require('../models/DailyUpdate');

// @desc    Submit daily data update from student portal
// @route   POST /api/student/daily-update
const submitDailyUpdate = async (req, res) => {
    try {
        const studentUserId = req.user.id;
        const { data_content } = req.body;

        if (!data_content) {
            return res.status(400).json({ success: false, message: "Content is required" });
        }

        const student = await Student.findOne({ user_id: studentUserId });
        
        if (!student) {
            return res.status(404).json({ success: false, message: "Student profile not found" });
        }

        if (!student.mentor_id) {
            return res.status(400).json({ success: false, message: "No mentor assigned. Please contact administration." });
        }

        const newUpdate = new DailyUpdate({
            student_id: student._id,
            mentor_id: student.mentor_id,
            data_content
        });

        await newUpdate.save();

        res.status(201).json({ success: true, message: "Daily update submitted successfully" });
    } catch (error) {
        console.error("Student Daily Update Error:", error);
        res.status(500).json({ success: false, message: "Server error during submission" });
    }
};

// @desc    Get student's own updates
// @route   GET /api/student/my-updates
const getMyUpdates = async (req, res) => {
    try {
        const studentUserId = req.user.id;
        const student = await Student.findOne({ user_id: studentUserId });
        
        if (!student) {
            return res.status(404).json({ success: false, message: "Student profile not found" });
        }

        const updates = await DailyUpdate.find({ student_id: student._id }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: updates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitDailyUpdate,
    getMyUpdates
};
