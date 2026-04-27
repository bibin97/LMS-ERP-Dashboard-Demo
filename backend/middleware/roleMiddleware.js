const requireRole = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role?.toLowerCase().trim();
        const allowedRoles = roles.map(r => r.toLowerCase().trim());

        if (!req.user || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user?.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { requireRole };
