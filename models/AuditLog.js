const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    movementRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MovementRequest'
    },
    ac: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AC',
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    modelNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['INWARD', 'OUTWARD'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    previousStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    // Proof Details
    proofType: {
        type: String,
        default: 'Delivery Challan'
    },
    proofNumber: {
        type: String,
        default: ''
    },
    proofImage: {
        type: String,
        default: ''
    },
    // Financial & Profit Margin Details
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
    totalAmount: {
        type: Number,
        default: 0
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issuedByName: {
        type: String,
        required: true
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    workerName: {
        type: String,
        default: 'Unknown Worker'
    },
    notes: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
