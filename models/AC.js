const mongoose = require('mongoose');

const ACSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true,
        index: true
    },
    modelNumber: {
        type: String,
        required: [true, 'Model Number is required'],
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    modelName: {
        type: String,
        trim: true,
        default: ''
    },
    capacity: {
        type: String,
        required: [true, 'Capacity is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Split', 'Window', 'Cassette', 'Tower', 'Portable'],
        default: 'Split'
    },
    currentStock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative']
    },
    costPrice: {
        type: Number,
        default: 0,
        min: [0, 'Cost price cannot be negative']
    },
    sellingPrice: {
        type: Number,
        default: 0,
        min: [0, 'Selling price cannot be negative']
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },
    location: {
        type: String,
        trim: true,
        default: 'General Warehouse Floor'
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Sync price with sellingPrice if needed
ACSchema.pre('save', function (next) {
    if (this.sellingPrice && (!this.price || this.isModified('sellingPrice'))) {
        this.price = this.sellingPrice;
    }
    if (typeof next === 'function') next();
});

module.exports = mongoose.model('AC', ACSchema);
