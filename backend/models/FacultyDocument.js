const mongoose = require('mongoose');

const facultyDocumentSchema = new mongoose.Schema({
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    file_url: { type: String, required: true },
    file_type: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FacultyDocument', facultyDocumentSchema);
