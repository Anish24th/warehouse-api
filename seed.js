require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const AC = require('./models/AC');
const MovementRequest = require('./models/MovementRequest');
const AuditLog = require('./models/AuditLog');
const IssueReport = require('./models/IssueReport');

const seedData = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ac_warehouse';
        await mongoose.connect(uri);
        console.log('🌱 Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await AC.deleteMany({});
        await MovementRequest.deleteMany({});
        await AuditLog.deleteMany({});
        await IssueReport.deleteMany({});
        console.log('🧹 Cleared existing data.');

        // 1. Create Users
        const owner = await User.create({
            name: 'Rajesh Sharma (Owner)',
            email: 'owner@warehouse.com',
            password: 'owner123',
            role: 'owner',
            phone: '+91 98765 43210'
        });

        const worker1 = await User.create({
            name: 'Amit Kumar (Worker)',
            email: 'worker1@warehouse.com',
            password: 'worker123',
            role: 'worker',
            phone: '+91 91234 56780'
        });

        const worker2 = await User.create({
            name: 'Sunil Verma (Worker)',
            email: 'worker2@warehouse.com',
            password: 'worker123',
            role: 'worker',
            phone: '+91 93456 78901'
        });

        console.log('👤 Users created (Owner & Workers).');

        // 2. Create AC Models with Cost Price & Selling Price
        const acsData = [
            {
                brand: 'Daikin',
                modelNumber: 'FTKM50U',
                modelName: '1.5 Ton 5-Star Inverter Split AC',
                capacity: '1.5 Ton',
                type: 'Split',
                currentStock: 45,
                costPrice: 38000,
                sellingPrice: 44500,
                price: 44500,
                location: 'Aisle A - Bay 01',
                description: 'Copper condenser, 3D Airflow, PM2.5 filter'
            },
            {
                brand: 'Voltas',
                modelNumber: '183V-VECTRA',
                modelName: '1.5 Ton 3-Star Adjustable Inverter Split AC',
                capacity: '1.5 Ton',
                type: 'Split',
                currentStock: 30,
                costPrice: 28500,
                sellingPrice: 32990,
                price: 32990,
                location: 'Aisle A - Bay 02',
                description: '4-in-1 adjustable mode, turbo cooling'
            },
            {
                brand: 'LG',
                modelNumber: 'TS-Q14YNZE',
                modelName: '1.0 Ton 5-Star AI DUAL Inverter Split AC',
                capacity: '1.0 Ton',
                type: 'Split',
                currentStock: 25,
                costPrice: 32000,
                sellingPrice: 37490,
                price: 37490,
                location: 'Aisle B - Bay 01',
                description: '6-in-1 AI convertible, anti-virus protection'
            },
            {
                brand: 'Carrier',
                modelNumber: 'CAI24ES3R30F0',
                modelName: '2.0 Ton 3-Star Heavy Duty Inverter AC',
                capacity: '2.0 Ton',
                type: 'Split',
                currentStock: 15,
                costPrice: 43000,
                sellingPrice: 49990,
                price: 49990,
                location: 'Aisle C - Heavy Bay',
                description: 'High ambient cooling up to 55°C, PM0.3 filter'
            },
            {
                brand: 'Blue Star',
                modelNumber: 'IC418YNU',
                modelName: '1.5 Ton 4-Star Inverter Split AC',
                capacity: '1.5 Ton',
                type: 'Split',
                currentStock: 20,
                costPrice: 34000,
                sellingPrice: 36990, // Margin is (36990-34000)/34000 = 8.8% (< 10% RED ALERT!)
                price: 36990,
                location: 'Aisle B - Bay 03',
                description: 'Acoustic jacket on compressor, hidden display'
            },
            {
                brand: 'Hitachi',
                modelNumber: 'RAS-G518PCAISF',
                modelName: '1.5 Ton 5-Star Expandable Plus Inverter AC',
                capacity: '1.5 Ton',
                type: 'Split',
                currentStock: 8,
                costPrice: 40000,
                sellingPrice: 46200,
                price: 46200,
                location: 'Aisle B - Bay 04',
                description: 'Ice Clean frost wash technology'
            }
        ];

        const insertedACs = await AC.insertMany(acsData);
        console.log(`❄️  ${insertedACs.length} AC models seeded with cost and selling prices.`);

        // 3. Create Sample Pending Movement Requests WITH PROOF & PROFIT MARGINS
        const daikinAC = insertedACs.find(a => a.modelNumber === 'FTKM50U');
        const blueStarAC = insertedACs.find(a => a.modelNumber === 'IC418YNU');

        // Normal Inward Request with Proof
        await MovementRequest.create({
            ac: daikinAC._id,
            type: 'INWARD',
            quantity: 10,
            worker: worker1._id,
            workerName: worker1.name,
            notes: 'Batch shipment from Daikin Neemrana factory',
            proofType: 'Delivery Challan',
            proofNumber: 'CH-DK-8821',
            proofImage: '',
            unitCost: daikinAC.costPrice,
            salePrice: daikinAC.sellingPrice,
            profitMarginPercent: 17.1,
            isLowProfit: false,
            status: 'PENDING'
        });

        // Outward Request with < 10% PROFIT (RED ALERT!)
        // Cost: 34000, Sale: 36000 -> Profit = (2000/34000)*100 = 5.9% (<10%)
        await MovementRequest.create({
            ac: blueStarAC._id,
            type: 'OUTWARD',
            quantity: 4,
            worker: worker2._id,
            workerName: worker2.name,
            notes: 'Wholesale clearance order to Indiranagar showroom',
            proofType: 'Tax Invoice',
            proofNumber: 'INV-BLU-4029',
            proofImage: '',
            unitCost: 34000,
            salePrice: 36000,
            profitMarginPercent: 5.9,
            isLowProfit: true, // RED ALERT FLAG!
            status: 'PENDING'
        });

        console.log('📋 Sample Pending Movement Requests with Proof and <10% Profit flags created.');

        // 4. Create Historical Audit Logs for Day-to-Day and Month-to-Month Sales Analytics
        const now = Date.now();
        const oneDay = 86400000;
        const oneMonth = 30 * oneDay;

        const voltasAC = insertedACs.find(a => a.modelNumber === '183V-VECTRA');
        const lgAC = insertedACs.find(a => a.modelNumber === 'TS-Q14YNZE');

        // Past logs
        await AuditLog.create([
            // Month 1 (Current Month - Today)
            {
                ac: daikinAC._id,
                brand: daikinAC.brand,
                modelNumber: daikinAC.modelNumber,
                type: 'OUTWARD',
                quantity: 6,
                previousStock: 51,
                newStock: 45,
                proofType: 'Delivery Challan',
                proofNumber: 'DC-9921',
                unitCost: daikinAC.costPrice,
                salePrice: daikinAC.sellingPrice,
                profitMarginPercent: 17.1,
                isLowProfit: false,
                totalAmount: 6 * daikinAC.sellingPrice,
                issuedBy: owner._id,
                issuedByName: owner.name,
                worker: worker1._id,
                workerName: worker1.name,
                notes: 'Dispatched to Croma Electronic City',
                timestamp: new Date(now - 3600000 * 4)
            },
            // Yesterday Outward (Low profit sale: 7.2%)
            {
                ac: blueStarAC._id,
                brand: blueStarAC.brand,
                modelNumber: blueStarAC.modelNumber,
                type: 'OUTWARD',
                quantity: 5,
                previousStock: 25,
                newStock: 20,
                proofType: 'Tax Invoice',
                proofNumber: 'INV-BS-883',
                unitCost: 34000,
                salePrice: 36450,
                profitMarginPercent: 7.2,
                isLowProfit: true, // RED
                totalAmount: 5 * 36450,
                issuedBy: owner._id,
                issuedByName: owner.name,
                worker: worker2._id,
                workerName: worker2.name,
                notes: 'Dealer volume discount order',
                timestamp: new Date(now - oneDay)
            },
            // 2 Days ago Inward
            {
                ac: voltasAC._id,
                brand: voltasAC.brand,
                modelNumber: voltasAC.modelNumber,
                type: 'INWARD',
                quantity: 15,
                previousStock: 15,
                newStock: 30,
                proofType: 'Lorry Receipt / LR',
                proofNumber: 'LR-VOL-101',
                unitCost: voltasAC.costPrice,
                salePrice: voltasAC.sellingPrice,
                profitMarginPercent: 15.8,
                isLowProfit: false,
                totalAmount: 15 * voltasAC.costPrice,
                issuedBy: owner._id,
                issuedByName: owner.name,
                worker: worker1._id,
                workerName: worker1.name,
                notes: 'Received shipment truck MH-12-8822',
                timestamp: new Date(now - oneDay * 2)
            },
            // Last Month Inward
            {
                ac: lgAC._id,
                brand: lgAC.brand,
                modelNumber: lgAC.modelNumber,
                type: 'INWARD',
                quantity: 20,
                previousStock: 5,
                newStock: 25,
                proofType: 'Delivery Challan',
                proofNumber: 'DC-LG-771',
                unitCost: lgAC.costPrice,
                salePrice: lgAC.sellingPrice,
                profitMarginPercent: 17.2,
                isLowProfit: false,
                totalAmount: 20 * lgAC.costPrice,
                issuedBy: owner._id,
                issuedByName: owner.name,
                worker: worker2._id,
                workerName: worker2.name,
                notes: 'Monthly godown replenishment',
                timestamp: new Date(now - oneMonth)
            },
            // Last Month Outward
            {
                ac: lgAC._id,
                brand: lgAC.brand,
                modelNumber: lgAC.modelNumber,
                type: 'OUTWARD',
                quantity: 10,
                previousStock: 25,
                newStock: 15,
                proofType: 'Tax Invoice',
                proofNumber: 'INV-LG-992',
                unitCost: lgAC.costPrice,
                salePrice: lgAC.sellingPrice,
                profitMarginPercent: 17.2,
                isLowProfit: false,
                totalAmount: 10 * lgAC.sellingPrice,
                issuedBy: owner._id,
                issuedByName: owner.name,
                worker: worker1._id,
                workerName: worker1.name,
                notes: 'Dispatched to Reliance Digital Koramangala',
                timestamp: new Date(now - oneMonth + oneDay * 2)
            }
        ]);

        console.log('📜 Initial Audit Logs for Day-to-Day and Month-to-Month Sales Analytics created.');

        // 5. Create Sample Issue Reports for the Owner's Problem Feed
        await IssueReport.create([
            {
                title: 'Barcode Label Torn on Carrier 2.0T Batch',
                description: 'During unloading of Carrier CAI24ES3R30F0, two cardboard boxes had damaged barcode tags on Bay C. Need reprint.',
                category: 'Damaged Goods',
                urgency: 'Medium',
                reportedBy: worker1.name,
                reportedByEmail: worker1.email,
                reporterRole: 'worker',
                status: 'OPEN'
            },
            {
                title: 'Discrepancy on Dock Loading Bay 02',
                description: 'Physical count for Voltas 1.5T units arrived as 14 on truck, but vendor challan listed 15. Need supplier verification.',
                category: 'Discrepancy',
                urgency: 'High',
                reportedBy: worker2.name,
                reportedByEmail: worker2.email,
                reporterRole: 'worker',
                status: 'OPEN'
            },
            {
                title: 'Inquiry on Bulk Purchase for Commercial Hitachi Units',
                description: 'Guest visitor asked about stock availability for 20 units of Hitachi 1.5 Ton for hospital ward delivery next week.',
                category: 'Stock Inquiry',
                urgency: 'Low',
                reportedBy: 'Kavita Sundaram (Guest)',
                reportedByEmail: 'kavita@healthcare.org',
                reporterRole: 'guest',
                status: 'OPEN'
            }
        ]);

        console.log('📢 Sample Problem Reports seeded for Owner Incident Feed.');
        console.log('\n✨ Database seeding completed successfully!');
        console.log('--------------------------------------------------');
        console.log('👑 Owner Credentials:');
        console.log('   Email: owner@warehouse.com');
        console.log('   Password: owner123');
        console.log('👷 Worker 1 Credentials:');
        console.log('   Email: worker1@warehouse.com');
        console.log('   Password: worker123');
        console.log('🌐 Guest Mode: Click "Browse as Guest" (No password)');
        console.log('--------------------------------------------------');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
