const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone_number: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ['super_admin', 'admin', 'sub_admin', 'mentor_head', 'academic_head', 'mentor', 'faculty']
    },
    status: { type: String, default: 'pending', enum: ['pending', 'active', 'inactive', 'rejected'] },
    isApproved: { type: Number, default: 0 },
    isActive: { type: Number, default: 0 },
    profile_image: { type: String },
    place: { type: String },
    permissions: mongoose.Schema.Types.Mixed,
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Faculty-specific fields
    faculty_id: { type: String, sparse: true },
    hourly_rate: { type: Number, default: 0 },
    qualification: { type: String },
    experience: { type: String },
    subjects: [{ type: String }],
    address: { type: String },
    bio: { type: String }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Static methods for transition
userSchema.statics.findByIdentifier = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { phone_number: identifier },
            { name: identifier }
        ]
    });
};

module.exports = mongoose.model('User', userSchema);
