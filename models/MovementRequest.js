const mongoose = require('mongoose');

const MovementRequestSchema = new mongoose.Schema({
    ac: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AC',
        required: [true, 'AC reference is required']
    },
    type: {
        type: String,
        enum: ['INWARD', 'OUTWARD'],
        required: [true, 'Movement type (INWARD or OUTWARD) is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1']
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Worker reference is required']
    },
    workerName: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    // Mandatory Proof
    proofType: {
        type: String,
        enum: ['Delivery Challan', 'Tax Invoice', 'Lorry Receipt / LR', 'Goods Inspection Slip', 'Other Document'],
        default: 'Delivery Challan'
    },
    proofNumber: {
        type: String,
        required: [true, 'Proof / Document reference number is mandatory (e.g. Challan or Invoice #)']
    },
    proofImage: {
        type: String,
        default: ''
    },
    // Pricing and Profit Margin Tracking
    unitCost: {
        type: Number,
        default: 0
    },
    salePrice: {
        type: Number,
        default: 0
    },
    profitMarginPercent: {
        type: Number,
        default: 0
    },
    isLowProfit: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedByName: {
        type: String,
        default: ''
    },
    reviewedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MovementRequest', MovementRequestSchema);
