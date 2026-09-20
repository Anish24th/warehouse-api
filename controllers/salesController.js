const AuditLog = require('../models/AuditLog');

// Get Sales & Purchase Analytics (Day-to-Day and Month-to-Month)
exports.getSalesAnalytics = async (req, res) => {
    try {
        // 1. Overall Lifetime Aggregates
        const overallAgg = await AuditLog.aggregate([
            {
                $group: {
                    _id: '$type',
                    totalQuantity: { $sum: '$quantity' },
                    totalValue: { $sum: { $ifNull: ['$totalAmount', 0] } }
                }
            }
        ]);

        let totalInwardUnits = 0;
        let totalInwardSpend = 0;
        let totalOutwardUnits = 0;
        let totalOutwardRevenue = 0;

        overallAgg.forEach(item => {
            if (item._id === 'INWARD') {
                totalInwardUnits = item.totalQuantity;
                totalInwardSpend = item.totalValue;
            } else if (item._id === 'OUTWARD') {
                totalOutwardUnits = item.totalQuantity;
                totalOutwardRevenue = item.totalValue;
            }
        });

        // 2. Low Profit Transactions Count (< 10%)
        const lowProfitCount = await AuditLog.countDocuments({
            type: 'OUTWARD',
            isLowProfit: true
        });

        // 3. Month-to-Month Aggregations
        const monthlyAgg = await AuditLog.aggregate([
            {
                $project: {
                    yearMonth: { $dateToString: { format: '%Y-%m', date: '$timestamp' } },
                    type: '$type',
                    quantity: '$quantity',
                    totalAmount: { $ifNull: ['$totalAmount', 0] },
                    isLowProfit: '$isLowProfit'
                }
            },
            {
                $group: {
                    _id: { yearMonth: '$yearMonth', type: '$type' },
                    units: { $sum: '$quantity' },
                    amount: { $sum: '$totalAmount' },
                    lowProfitUnits: {
                        $sum: { $cond: [{ $eq: ['$isLowProfit', true] }, '$quantity', 0] }
                    }
                }
            },
            { $sort: { '_id.yearMonth': -1 } }
        ]);

        // Reformat monthly data into unified monthly rows
        const monthlyMap = {};
        monthlyAgg.forEach(row => {
            const ym = row._id.yearMonth;
            if (!monthlyMap[ym]) {
                monthlyMap[ym] = {
                    month: ym,
                    inwardUnits: 0,
                    inwardSpend: 0,
                    outwardUnits: 0,
                    outwardRevenue: 0,
                    lowProfitUnits: 0
                };
            }
            if (row._id.type === 'INWARD') {
                monthlyMap[ym].inwardUnits = row.units;
                monthlyMap[ym].inwardSpend = row.amount;
            } else if (row._id.type === 'OUTWARD') {
                monthlyMap[ym].outwardUnits = row.units;
                monthlyMap[ym].outwardRevenue = row.amount;
                monthlyMap[ym].lowProfitUnits = row.lowProfitUnits;
            }
        });

        const monthlyStats = Object.values(monthlyMap).map(m => ({
            ...m,
            netGrossProfit: m.outwardRevenue - (m.outwardUnits * (m.inwardUnits > 0 ? (m.inwardSpend / m.inwardUnits) : 30000))
        }));

        // 4. Day-to-Day Aggregations (Last 30 Days)
        const dailyAgg = await AuditLog.aggregate([
            {
                $project: {
                    day: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                    type: '$type',
                    quantity: '$quantity',
                    totalAmount: { $ifNull: ['$totalAmount', 0] },
                    isLowProfit: '$isLowProfit'
                }
            },
            {
                $group: {
                    _id: { day: '$day', type: '$type' },
                    units: { $sum: '$quantity' },
                    amount: { $sum: '$totalAmount' },
                    lowProfitCount: {
                        $sum: { $cond: [{ $eq: ['$isLowProfit', true] }, 1, 0] }
                    }
                }
            },
            { $sort: { '_id.day': -1 } },
            { $limit: 30 }
        ]);

        const dailyMap = {};
        dailyAgg.forEach(row => {
            const d = row._id.day;
            if (!dailyMap[d]) {
                dailyMap[d] = {
                    day: d,
                    inwardUnits: 0,
                    inwardSpend: 0,
                    outwardUnits: 0,
                    outwardRevenue: 0,
                    lowProfitCount: 0
                };
            }
            if (row._id.type === 'INWARD') {
                dailyMap[d].inwardUnits = row.units;
                dailyMap[d].inwardSpend = row.amount;
            } else if (row._id.type === 'OUTWARD') {
                dailyMap[d].outwardUnits = row.units;
                dailyMap[d].outwardRevenue = row.amount;
                dailyMap[d].lowProfitCount = row.lowProfitCount;
            }
        });

        const dailyStats = Object.values(dailyMap);

        // 5. Recent Sales Outward Transactions with Profit Margins
        const recentSales = await AuditLog.find({ type: 'OUTWARD' })
            .sort({ timestamp: -1 })
            .limit(20);

        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalInwardUnits,
                    totalInwardSpend,
                    totalOutwardUnits,
                    totalOutwardRevenue,
                    netGrossMargin: totalOutwardRevenue - (totalOutwardUnits * (totalInwardUnits > 0 ? totalInwardSpend / totalInwardUnits : 28000)),
                    lowProfitCount
                },
                monthlyStats,
                dailyStats,
                recentSales
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching sales analytics'
        });
    }
};
