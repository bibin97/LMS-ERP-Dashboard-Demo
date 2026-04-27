const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registration_number: { type: String, unique: true },
    roll_number: { type: String },
    password: { type: String, required: true },
    grade: { type: String },
    course: { type: String },
    subject: { type: String },
    hour: { type: String },
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mentor_name: { type: String },
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    faculty_name: { type: String },
    status: { type: String, default: 'pending', enum: ['pending', 'active', 'inactive', 'rejected', 'completed'] },
    isApproved: { type: Number, default: 0 },
    profile_image: { type: String },
    time_table: { type: mongoose.Schema.Types.Mixed }, // Flexible for JSON
    next_installment_date: { type: Date },
    enrollment_type: { type: String },
    meeting_link: { type: String },
    badge: { type: String },
    onboarding_status: { type: String, default: 'Pending' },
    attendance_percentage: { type: Number, default: 0 },
    performance_status: { type: String, default: 'Neutral' },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
