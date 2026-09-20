const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (payload, expiresIn = '7d') => {
    const secret = process.env.JWT_SECRET || 'supersecret_ac_warehouse_jwt_key_2026';
    return jwt.sign(payload, secret, { expiresIn });
};

// Register (Owner-only for public signup)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password.'
            });
        }

        // Enforce restriction: Floor workers cannot self-register by will!
        if (role === 'worker') {
            return res.status(403).json({
                success: false,
                message: 'Worker accounts cannot self-register. Worker accounts must be assigned and created by the Warehouse Owner.'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            role: 'owner', // Default public self-registration is Owner only
            phone: phone || ''
        });

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return res.status(201).json({
            success: true,
            message: 'Owner account registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error during registration'
        });
    }
};

// Owner Provisions & Assigns Worker Account
exports.createWorker = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Worker name, email, and initial password are required.'
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: `An account with email ${email} already exists.`
            });
        }

        const worker = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: 'worker',
            phone: phone || ''
        });

        return res.status(201).json({
            success: true,
            message: `Worker account created for ${worker.name}. Login credentials assigned.`,
            worker: {
                id: worker._id,
                name: worker.name,
                email: worker.email,
                role: worker.role,
                phone: worker.phone,
                createdAt: worker.createdAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error creating worker account'
        });
    }
};

// Guest Mode Login (Stateless token for high concurrency, 100+ users)
exports.guestLogin = async (req, res) => {
    try {
        const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        const token = generateToken({
            id: guestId,
            email: `${guestId}@guest.local`,
            role: 'guest',
            name: 'Guest Explorer'
        }, '24h');

        return res.status(200).json({
            success: true,
            message: 'Signed in as Guest Explorer',
            token,
            user: {
                id: guestId,
                name: 'Guest Explorer',
                email: 'guest@warehouse.local',
                role: 'guest'
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error generating guest session'
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = generateToken({
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// Get current profile
exports.getMe = async (req, res) => {
    try {
        if (req.user.role === 'guest') {
            return res.status(200).json({
                success: true,
                user: req.user
            });
        }
        const user = await User.findById(req.user._id).select('-password');
        return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching profile'
        });
    }
};

// Get all workers (for Owner's worker management desk)
exports.getWorkers = async (req, res) => {
    try {
        const workers = await User.find({ role: 'worker' }).select('-password').sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: workers.length,
            data: workers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching workers'
        });
    }
};
