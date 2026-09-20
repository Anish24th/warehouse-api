const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No authentication token provided.'
        });
    }

    try {
        const secret = process.env.JWT_SECRET || 'supersecret_ac_warehouse_jwt_key_2026';
        const decoded = jwt.verify(token, secret);
        
        // Handle guest user stateless session
        if (decoded.role === 'guest') {
            req.user = {
                _id: decoded.id,
                id: decoded.id,
                name: decoded.name || 'Guest Explorer',
                email: decoded.email || 'guest@warehouse.local',
                role: 'guest'
            };
            return next();
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User session invalid or user not found.'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden. Requires one of [${allowedRoles.join(', ')}] roles.`
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole
};
