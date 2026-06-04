const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    action: { type: String, required: true },
    details: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
