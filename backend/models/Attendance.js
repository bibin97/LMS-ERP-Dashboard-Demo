const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    session_id: { type: String, required: true }, // Can be a String or ObjectId depending on session modeling
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
    marked_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Ensure unique composite key (session_id + student_id)
attendanceSchema.index({ session_id: 1, student_id: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
