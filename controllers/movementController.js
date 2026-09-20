const MovementRequest = require('../models/MovementRequest');
const AC = require('../models/AC');
const AuditLog = require('../models/AuditLog');

// Worker creates movement entry (Entered or Left) WITH MANDATORY PROOF & PROFIT MARGIN
exports.createMovementRequest = async (req, res) => {
    try {
        const { 
            acId, 
            type, 
            quantity, 
            notes, 
            proofType, 
            proofNumber, 
            proofImage,
            salePrice 
        } = req.body;

        if (!acId || !type || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'AC model, movement type (INWARD/OUTWARD), and quantity are required.'
            });
        }

        // MANDATORY PROOF REQUIREMENT: Workers must provide proof to submit logs
        if (!proofNumber || !proofNumber.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Proof of movement is mandatory. You must provide a Document / Challan / Invoice Reference Number.'
            });
        }

        const normalizedType = type.toUpperCase().trim();
        if (!['INWARD', 'OUTWARD'].includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                message: "Type must be either 'INWARD' (entered) or 'OUTWARD' (left)."
            });
        }

        const parsedQuantity = parseInt(quantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer.'
            });
        }

        const ac = await AC.findById(acId);
        if (!ac) {
            return res.status(404).json({
                success: false,
                message: 'Selected AC model was not found.'
            });
        }

        // Calculate Cost, Sale Price, and Profit Margin
        const unitCost = ac.costPrice > 0 ? ac.costPrice : Math.round((ac.price || 30000) * 0.82);
        const effectiveSalePrice = salePrice ? parseFloat(salePrice) : (ac.sellingPrice > 0 ? ac.sellingPrice : (ac.price || 35000));
        
        let profitMarginPercent = 0;
        let isLowProfit = false;

        if (normalizedType === 'OUTWARD') {
            if (unitCost > 0) {
                profitMarginPercent = Number((((effectiveSalePrice - unitCost) / unitCost) * 100).toFixed(1));
            } else {
                profitMarginPercent = 12.0;
            }
            // Flag RED if profit is less than 10%
            if (profitMarginPercent < 10) {
                isLowProfit = true;
            }
        }

        const movement = await MovementRequest.create({
            ac: ac._id,
            type: normalizedType,
            quantity: parsedQuantity,
            worker: req.user._id,
            workerName: req.user.name,
            notes: notes ? notes.trim() : '',
            proofType: proofType || 'Delivery Challan',
            proofNumber: proofNumber.trim(),
            proofImage: proofImage || '',
            unitCost,
            salePrice: effectiveSalePrice,
            profitMarginPercent,
            isLowProfit,
            status: 'PENDING'
        });

        const populatedMovement = await MovementRequest.findById(movement._id).populate('ac');

        return res.status(201).json({
            success: true,
            message: `Movement request submitted for ${parsedQuantity} units (${normalizedType}) with verified proof. Awaiting owner review.${isLowProfit ? ' ⚠️ Low profit margin alert (< 10%) has been flagged.' : ''}`,
            data: populatedMovement
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error submitting movement request'
        });
    }
};

// Owner gets pending movement requests
exports.getPendingRequests = async (req, res) => {
    try {
        const pending = await MovementRequest.find({ status: 'PENDING' })
            .populate('ac')
            .populate('worker', 'name email phone')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: pending.length,
            data: pending
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching pending requests'
        });
    }
};

// Worker gets their own submissions
exports.getMyRequests = async (req, res) => {
    try {
        const myRequests = await MovementRequest.find({ worker: req.user._id })
            .populate('ac')
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({
            success: true,
            count: myRequests.length,
            data: myRequests
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching submissions'
        });
    }
};

// Owner gets all requests
exports.getAllRequests = async (req, res) => {
    try {
        const { status, type } = req.query;
        let query = {};
        if (status) query.status = status.toUpperCase();
        if (type) query.type = type.toUpperCase();

        const requests = await MovementRequest.find(query)
            .populate('ac')
            .populate('worker', 'name email')
            .populate('reviewedBy', 'name')
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching requests'
        });
    }
};

// Owner reviews (Approves and Issues to Logs, or Rejects)
exports.reviewMovementRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, remarks } = req.body;

        if (!['APPROVE', 'REJECT'].includes(action?.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Action must be either 'APPROVE' or 'REJECT'."
            });
        }

        const request = await MovementRequest.findById(id).populate('ac');
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Movement request not found.'
            });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `This request has already been ${request.status.toLowerCase()}.`
            });
        }

        const ac = await AC.findById(request.ac._id);
        if (!ac) {
            return res.status(404).json({
                success: false,
                message: 'Referenced AC model no longer exists in inventory.'
            });
        }

        if (action.toUpperCase() === 'APPROVE') {
            const prevStock = ac.currentStock;
            let newStock = prevStock;

            if (request.type === 'INWARD') {
                newStock = prevStock + request.quantity;
            } else if (request.type === 'OUTWARD') {
                if (prevStock < request.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot approve outward movement: requested ${request.quantity} units, but warehouse only has ${prevStock} units in stock.`
                    });
                }
                newStock = prevStock - request.quantity;
            }

            // Update AC stock
            ac.currentStock = newStock;
            await ac.save();

            // Mark request approved
            request.status = 'APPROVED';
            request.reviewedBy = req.user._id;
            request.reviewedByName = req.user.name;
            request.reviewedAt = new Date();
            await request.save();

            const unitRate = request.type === 'INWARD' ? (request.unitCost || ac.costPrice) : (request.salePrice || ac.sellingPrice || ac.price);
            const totalAmount = (unitRate || 0) * request.quantity;

            // Create official Audit Log
            const auditLog = await AuditLog.create({
                movementRequest: request._id,
                ac: ac._id,
                brand: ac.brand,
                modelNumber: ac.modelNumber,
                type: request.type,
                quantity: request.quantity,
                previousStock: prevStock,
                newStock: newStock,
                proofType: request.proofType,
                proofNumber: request.proofNumber,
                proofImage: request.proofImage,
                unitCost: request.unitCost,
                salePrice: request.salePrice,
                profitMarginPercent: request.profitMarginPercent,
                isLowProfit: request.isLowProfit,
                totalAmount,
                issuedBy: req.user._id,
                issuedByName: req.user.name,
                worker: request.worker,
                workerName: request.workerName,
                notes: remarks ? `${request.notes} (Owner: ${remarks})`.trim() : request.notes,
                timestamp: new Date()
            });

            return res.status(200).json({
                success: true,
                message: `Movement approved! Stock updated to ${newStock} and officially issued to warehouse logs.`,
                data: {
                    request,
                    updatedStock: newStock,
                    auditLog
                }
            });
        } else {
            // REJECT
            request.status = 'REJECTED';
            request.rejectionReason = remarks || 'Discrepancy identified during owner cross-check';
            request.reviewedBy = req.user._id;
            request.reviewedByName = req.user.name;
            request.reviewedAt = new Date();
            await request.save();

            return res.status(200).json({
                success: true,
                message: 'Movement request rejected.',
                data: request
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error reviewing movement request'
        });
    }
};
