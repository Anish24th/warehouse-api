const IssueReport = require('../models/IssueReport');

// Submit Problem / Issue / Feedback (Worker, Guest, or Owner)
exports.createIssue = async (req, res) => {
    try {
        const { title, description, category, urgency } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: 'Title and description are required to report an issue.'
            });
        }

        const reporterName = req.user ? req.user.name : (req.body.reportedBy || 'Guest Explorer');
        const reporterRole = req.user ? req.user.role : 'guest';
        const reporterEmail = req.user ? req.user.email : (req.body.reportedByEmail || '');

        const issue = await IssueReport.create({
            title: title.trim(),
            description: description.trim(),
            category: category || 'General',
            urgency: urgency || 'Medium',
            reportedBy: reporterName,
            reportedByEmail: reporterEmail,
            reporterRole,
            status: 'OPEN'
        });

        return res.status(201).json({
            success: true,
            message: 'Problem report submitted successfully. Notified to warehouse owner.',
            data: issue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error submitting problem report'
        });
    }
};

// Owner gets all issues in the Problem Feed
exports.getAllIssues = async (req, res) => {
    try {
        const { status, category, urgency } = req.query;
        let query = {};

        if (status) query.status = status.toUpperCase();
        if (category) query.category = category;
        if (urgency) query.urgency = urgency;

        const issues = await IssueReport.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: issues.length,
            data: issues
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching issue feed'
        });
    }
};

// Owner marks an issue resolved
exports.resolveIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolutionNotes } = req.body;

        const issue = await IssueReport.findById(id);
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Issue report not found.'
            });
        }

        issue.status = 'RESOLVED';
        issue.resolutionNotes = resolutionNotes || 'Issue addressed and resolved by Owner';
        issue.resolvedBy = req.user._id;
        issue.resolvedByName = req.user.name;
        issue.resolvedAt = new Date();

        await issue.save();

        return res.status(200).json({
            success: true,
            message: 'Issue marked as resolved.',
            data: issue
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error resolving issue'
        });
    }
};
