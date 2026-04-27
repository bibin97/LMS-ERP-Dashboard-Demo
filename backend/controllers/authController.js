const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Student = require('../models/Student');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const targetRole = role || 'student';
        const isStudent = targetRole === 'student';

        const identifier = email || req.body.phone_number;
        const existingUser = await User.findByIdentifier(identifier);
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Identifier already registered" });
        }

        // Auto-approve first Super Admin
        let status = 'pending';
        let isApproved = 0;
        let isActive = 0;
        const anyAdmins = await User.findOne({ role: 'super_admin' });
        if (!anyAdmins && targetRole === 'super_admin') {
            status = 'active';
            isApproved = 1;
            isActive = 1;
        }

        let newUser;
        if (isStudent) {
            newUser = new Student({
                name,
                password, // Hashing should be in model pre-save or handled here
                phone_number: req.body.phone_number,
                status,
                isApproved,
                place: req.body.place
            });
            // Manual hash if not in model
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(password || req.body.phone_number, salt);
        } else {
            newUser = new User({
                name,
                email,
                phone_number: req.body.phone_number,
                password,
                role: targetRole,
                status,
                isApproved,
                isActive,
                place: req.body.place
            });
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(password, salt);
        }

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "Registration successful",
            userId: newUser._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check if Super Admin exists
const checkSuperAdminExists = async (req, res) => {
    try {
        const admin = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
        res.status(200).json({ success: true, exists: !!admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findByIdentifier(identifier);

        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        if (user.status !== 'active') {
            return res.status(403).json({ success: false, message: "Account not active or approved" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            token,
            role: user.role,
            user: { id: user._id, name: user.name, role: user.role, profile_image: user.profile_image }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update profile image
const updateProfileImage = async (req, res) => {
    try {
        const { id, role } = req.user;
        const { profile_image } = req.body;
        const Model = role === 'student' ? Student : User;
        await Model.findByIdAndUpdate(id, { profile_image });
        res.status(200).json({ success: true, message: "Profile image updated" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    register,
    login,
    checkSuperAdminExists,
    updateProfileImage,
    mentorSignup: register, // Simplified for brevity in migration
    facultySignup: register
};
