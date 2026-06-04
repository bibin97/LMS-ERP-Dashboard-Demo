const mongoose = require('mongoose');

const facultyInteractionLogSchema = new mongoose.Schema({
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    date: { type: Date, required: true },
    session_number: { type: Number },
    chapter: { type: String },
    session_type: { type: String },
    topics_covered: { type: String },
    student_performance: { type: String },
    engagement_level: { type: String },
    homework_given: { type: String },
    homework_status: { type: String },
    test_score: { type: Number },
    issues_reported: { type: String },
    risk_level: { type: String },
    remedial_plan: { type: String },
    parent_update_needed: { type: Boolean, default: false },
    faculty_intervention_required: { type: String },
    notes: { type: String },
    screenshot_url: { type: String },
    verification_status: { type: String, enum: ['Pending', 'Verified', 'Flagged'], default: 'Pending' },
    verification_remarks: { type: String },
    verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FacultyInteractionLog', facultyInteractionLogSchema);
