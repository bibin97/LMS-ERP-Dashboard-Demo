const mongoose = require('mongoose');

const mentorshipLogSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    session_date: { type: Date, required: true },
    main_issue: { type: String },
    secondary_issue: { type: String },
    weak_subject: { type: String },
    consistency_rating: { type: Number },
    focus_rating: { type: Number },
    effort_level: { type: String },
    homework_status: { type: String },
    action_type: { type: String },
    action_details: { type: String },
    follow_up_required: { type: Boolean, default: false },
    follow_up_date: { type: Date },
    priority: { type: String },
    student_status: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MentorshipLog', mentorshipLogSchema);
