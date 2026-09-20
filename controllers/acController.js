const AC = require('../models/AC');

// Get all ACs
exports.getAllACs = async (req, res) => {
    try {
        const { search, brand, type } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { modelNumber: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { modelName: { $regex: search, $options: 'i' } }
            ];
        }

        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }

        if (type) {
            query.type = type;
        }

        const acs = await AC.find(query).sort({ brand: 1, modelNumber: 1 });

        return res.status(200).json({
            success: true,
            count: acs.length,
            data: acs
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error fetching AC models'
        });
    }
};

// Get single AC by ID
exports.getACById = async (req, res) => {
    try {
        const ac = await AC.findById(req.params.id);
        if (!ac) {
            return res.status(404).json({
                success: false,
                message: 'AC model not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: ac
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching AC model'
        });
    }
};

// Create new AC model (Owner only)
exports.createAC = async (req, res) => {
    try {
        const { brand, modelNumber, modelName, capacity, type, currentStock, price, location, description } = req.body;

        if (!brand || !modelNumber || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'Brand, Model Number, and Capacity are required.'
            });
        }

        const existingAC = await AC.findOne({ modelNumber: modelNumber.toUpperCase().trim() });
        if (existingAC) {
            return res.status(400).json({
                success: false,
                message: `AC Model Number '${modelNumber}' already exists in inventory.`
            });
        }

        const ac = await AC.create({
            brand: brand.trim(),
            modelNumber: modelNumber.toUpperCase().trim(),
            modelName: modelName ? modelName.trim() : '',
            capacity: capacity.trim(),
            type: type || 'Split',
            currentStock: currentStock ? parseInt(currentStock, 10) : 0,
            price: price ? parseFloat(price) : 0,
            location: location || 'General Warehouse Floor',
            description: description || ''
        });

        return res.status(201).json({
            success: true,
            message: 'AC model registered successfully',
            data: ac
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error creating AC model'
        });
    }
};

// Update AC model (Owner only)
exports.updateAC = async (req, res) => {
    try {
        const ac = await AC.findById(req.params.id);
        if (!ac) {
            return res.status(404).json({
                success: false,
                message: 'AC model not found'
            });
        }

        const allowedFields = ['brand', 'modelName', 'capacity', 'type', 'price', 'location', 'description'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                ac[field] = req.body[field];
            }
        });

        await ac.save();

        return res.status(200).json({
            success: true,
            message: 'AC model updated successfully',
            data: ac
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Error updating AC model'
        });
    }
};

// Delete AC model (Owner only)
exports.deleteAC = async (req, res) => {
    try {
        const ac = await AC.findById(req.params.id);
        if (!ac) {
            return res.status(404).json({
                success: false,
                message: 'AC model not found'
            });
        }

        if (ac.currentStock > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete model '${ac.modelNumber}' because it still has ${ac.currentStock} units in stock.`
            });
        }

        await AC.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'AC model removed successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting AC model'
        });
    }
};
