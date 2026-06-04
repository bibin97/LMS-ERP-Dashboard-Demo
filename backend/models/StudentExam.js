const mongoose = require('mongoose');

const studentExamSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    milestone_session: { type: Number, required: true },
    chapter: { type: String },
    portions: { type: String },
    exam_type: { type: String, enum: ['MCQ', 'Written', 'Viva'], default: 'MCQ' },
    scheduled_date: { type: Date },
    status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
    score: { type: Number },
    remarks: { type: String }
}, { timestamps: true });

// Composite unique key to prevent duplicate milestones for same student
studentExamSchema.index({ student_id: 1, milestone_session: 1 }, { unique: true });

module.exports = mongoose.model('StudentExam', studentExamSchema);
