const mongoose = require('mongoose');

const dailyHoursLogSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hours: { type: Number, required: true },
    date: { type: Date, required: true }
}, { timestamps: true });

dailyHoursLogSchema.index({ student_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyHoursLog', dailyHoursLogSchema);
