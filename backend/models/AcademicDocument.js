const mongoose = require('mongoose');

const academicDocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    file_url: { type: String, required: true },
    category: { type: String, default: 'General' },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AcademicDocument', academicDocumentSchema);
