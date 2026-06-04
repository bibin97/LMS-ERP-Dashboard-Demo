const mongoose = require('mongoose');

const mentorSessionSchema = new mongoose.Schema({
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    session_number: { type: Number },
    date: { type: Date, required: true },
    start_time: { type: String },
    end_time: { type: String },
    duration: { type: String },
    chapter: { type: String },
    session_type: { type: String, default: 'Regular Class' },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'Postponed', 'No Show'], default: 'Scheduled' },
    status_reason: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MentorSession', mentorSessionSchema);
