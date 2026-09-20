const AC = require('../models/AC');
const MovementRequest = require('../models/MovementRequest');
const AuditLog = require('../models/AuditLog');

// Get Warehouse Statistics for Owner Dashboard
exports.getStats = async (req, res) => {
    try {
        const totalModels = await AC.countDocuments();
        
        // Sum total stock across all ACs
        const stockAggregate = await AC.aggregate([
            { $group: { _id: null, totalStock: { $sum: '$currentStock' }, totalValuation: { $sum: { $multiply: ['$currentStock', '$price'] } } } }
        ]);
        const totalStock = stockAggregate.length > 0 ? stockAggregate[0].totalStock : 0;
        const totalValuation = stockAggregate.length > 0 ? stockAggregate[0].totalValuation : 0;

        // Pending movements
        const pendingCount = await MovementRequest.countDocuments({ status: 'PENDING' });

        // Start of today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Inward today
        const inwardTodayAgg = await AuditLog.aggregate([
            { $match: { type: 'INWARD', timestamp: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        const inwardToday = inwardTodayAgg.length > 0 ? inwardTodayAgg[0].total : 0;

        // Outward today
        const outwardTodayAgg = await AuditLog.aggregate([
            { $match: { type: 'OUTWARD', timestamp: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        const outwardToday = outwardTodayAgg.length > 0 ? outwardTodayAgg[0].total : 0;

        // Low stock items (stock <= 5)
        const lowStockItems = await AC.find({ currentStock: { $lte: 5 } }).limit(5);

        // Recent audit logs
        const recentLogs = await AuditLog.find().sort({ timestamp: -1 }).limit(6);

        return res.status(200).json({
            success: true,
            data: {
                totalStock,
                totalModels,
                totalValuation,
                pendingCount,
                inwardToday,
                outwardToday,
                lowStockCount: lowStockItems.length,
                lowStockItems,
                recentLogs
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching dashboard stats'
        });
    }
};
