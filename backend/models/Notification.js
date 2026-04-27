const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Optional: if specific to student
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
    type: { type: String, enum: ['system', 'alert', 'message', 'attendance'], default: 'system' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
