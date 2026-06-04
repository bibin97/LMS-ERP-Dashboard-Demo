const mongoose = require('mongoose');

const studentMarkSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
    total: { type: Number, required: true },
    grade: { type: String },
    term: { type: String },
    exam_date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('StudentMark', studentMarkSchema);
