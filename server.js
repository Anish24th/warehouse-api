require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const acRoutes = require('./routes/acRoutes');
const movementRoutes = require('./routes/movementRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const logRoutes = require('./routes/logRoutes');
const salesRoutes = require('./routes/salesRoutes');
const issueRoutes = require('./routes/issueRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware (with increased limit for document/proof photo attachments)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger in dev
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next();
    });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ac', acRoutes);
app.use('/api/movements', movementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/issues', issueRoutes);

// Base Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date(),
        version: '1.2.0'
    });
});

// Serve frontend in production if built
const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));

// Fallback for SPA (Express 5 compatible)
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).json({
                message: 'AC Warehouse Management API is running. Frontend client is being served.'
            });
        }
    });
});

// Central Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 AC Warehouse Server listening on port ${PORT}`);
});

module.exports = app;