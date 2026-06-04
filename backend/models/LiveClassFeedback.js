const mongoose = require('mongoose');

const liveClassFeedbackSchema = new mongoose.Schema({
    academic_head_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    joined_class: { type: Boolean, default: false },
    faculty_active: { type: Boolean, default: false },
    interactive: { type: Boolean, default: false },
    faculty_camera_on: { type: Boolean, default: false },
    student_camera_on: { type: Boolean, default: false },
    remarks: { type: String },
    proof_url: { type: String },
    class_date: { type: Date },
    energy_level: { type: Number, default: 0 },
    screen_sharing: { type: Boolean, default: false },
    faculty_background: { type: Boolean, default: false },
    student_interaction_level: { type: Number, default: 0 },
    check_method: { type: String, default: 'Direct' }
}, { timestamps: true });

module.exports = mongoose.model('LiveClassFeedback', liveClassFeedbackSchema);
