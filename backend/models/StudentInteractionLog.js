const mongoose = require('mongoose');

const studentInteractionLogSchema = new mongoose.Schema({
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, required: true },
    session_number: { type: Number },
    connection_method: { type: String },
    self_clarity: { type: Number },
    confusing_topic: { type: String },
    can_solve_independently: { type: String },
    homework_status: { type: String },
    homework_difficulty: { type: String },
    revision_quality: { type: String },
    confidence: { type: Number },
    motivation_level: { type: String },
    exam_anxiety: { type: String },
    focus_level: { type: String },
    student_requests: { type: String },
    parent_update_priority: { type: String },
    mentor_action_needed: { type: String },
    mentor_notes: { type: String },
    connected_today: { type: Boolean, default: false },
    screenshot_url: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('StudentInteractionLog', studentInteractionLogSchema);
