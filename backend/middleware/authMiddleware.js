const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ success: false, message: "Not authorized, user not found" });
            }

            if (user.status !== 'active') {
                return res.status(403).json({ success: false, message: "Account is inactive/blocked" });
            }

            if (user.isApproved !== 1) {
                return res.status(403).json({ success: false, message: "Account pending approval" });
            }

            req.user = user;
            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user.role}) is not authorized to access this resource`
            });
        }
        next();
    };
};

module.exports = { protect, authorize, requireAuth: protect };
