const AuditLog = require('../models/AuditLog');

// Get official warehouse audit logs
exports.getAuditLogs = async (req, res) => {
    try {
        const { search, type, limit = 100 } = req.query;
        let query = {};

        if (type && ['INWARD', 'OUTWARD'].includes(type.toUpperCase())) {
            query.type = type.toUpperCase();
        }

        if (search) {
            query.$or = [
                { modelNumber: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { workerName: { $regex: search, $options: 'i' } },
                { issuedByName: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        const logs = await AuditLog.find(query)
            .populate('ac', 'brand modelNumber capacity type currentStock location')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit, 10));

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching audit logs'
        });
    }
};
