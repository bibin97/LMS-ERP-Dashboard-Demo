const mongoose = require('mongoose');

const dailyUpdateSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    mentor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data_content: { type: String },
    date: { type: Date, default: Date.now },
    time: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DailyUpdate', dailyUpdateSchema);
