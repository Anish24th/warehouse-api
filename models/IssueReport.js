const mongoose = require('mongoose');

const IssueReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Issue title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Issue description is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Discrepancy', 'Damaged Goods', 'App Glitch', 'Stock Inquiry', 'General'],
        default: 'General'
    },
    urgency: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    reportedBy: {
        type: String,
        required: true,
        trim: true
    },
    reportedByEmail: {
        type: String,
        default: '',
        trim: true
    },
    reporterRole: {
        type: String,
        enum: ['worker', 'guest', 'owner'],
        default: 'worker'
    },
    status: {
        type: String,
        enum: ['OPEN', 'RESOLVED'],
        default: 'OPEN',
        index: true
    },
    resolutionNotes: {
        type: String,
        default: ''
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedByName: {
        type: String,
        default: ''
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('IssueReport', IssueReportSchema);
