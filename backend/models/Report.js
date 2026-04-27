const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, required: true },
    remarks: { type: String },
    action_taken: { type: String },
    status: { type: String, enum: ['Open', 'Resolved', 'Pending'], default: 'Open' },
    follow_up_date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
