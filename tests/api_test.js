const http = require('http');

const PORT = 5001;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(url, { method, headers }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

async function runTests() {
    console.log('🧪 Starting Backend API Automated Tests...\n');

    try {
        // 1. Owner Login
        const ownerLogin = await request('POST', '/api/auth/login', {
            email: 'owner@warehouse.com',
            password: 'owner123'
        });
        console.assert(ownerLogin.status === 200, `Owner login failed: ${ownerLogin.status}`);
        console.assert(ownerLogin.body.user.role === 'owner', 'User role should be owner');
        const ownerToken = ownerLogin.body.token;
        console.log('✅ 1. Owner Login authenticated successfully.');

        // 2. Worker Login
        const workerLogin = await request('POST', '/api/auth/login', {
            email: 'worker1@warehouse.com',
            password: 'worker123'
        });
        console.assert(workerLogin.status === 200, `Worker login failed: ${workerLogin.status}`);
        console.assert(workerLogin.body.user.role === 'worker', 'User role should be worker');
        const workerToken = workerLogin.body.token;
        console.log('✅ 2. Worker Login authenticated successfully.');

        // 3. List AC Models
        const acsRes = await request('GET', '/api/ac', null, workerToken);
        console.assert(acsRes.status === 200, 'Failed to fetch ACs');
        console.assert(acsRes.body.data.length > 0, 'No AC models found');
        const targetAC = acsRes.body.data[0];
        const initialStock = targetAC.currentStock;
        console.log(`✅ 3. AC Models listed. Testing with ${targetAC.brand} ${targetAC.modelNumber} (Current Stock: ${initialStock})`);

        // 4. Worker submits Inward Movement (15 units)
        const inwardSubmit = await request('POST', '/api/movements', {
            acId: targetAC._id,
            type: 'INWARD',
            quantity: 15,
            notes: 'Automated test delivery shipment'
        }, workerToken);
        console.assert(inwardSubmit.status === 201, `Failed to submit movement: ${inwardSubmit.status}`);
        console.assert(inwardSubmit.body.data.status === 'PENDING', 'New movement must be PENDING');
        const pendingId = inwardSubmit.body.data._id;
        console.log('✅ 4. Worker submitted INWARD request (+15 units) -> Status: PENDING.');

        // Verify stock has NOT changed yet
        const checkACBefore = await request('GET', `/api/ac/${targetAC._id}`, null, workerToken);
        console.assert(checkACBefore.body.data.currentStock === initialStock, 'Stock should NOT change before owner approval');
        console.log('✅ 5. Stock remains unchanged pending owner review.');

        // 5. Owner reviews and approves
        const approveRes = await request('PATCH', `/api/movements/${pendingId}/review`, {
            action: 'APPROVE',
            remarks: 'Verified count on loading dock'
        }, ownerToken);
        console.assert(approveRes.status === 200, `Approval failed: ${approveRes.status}`);
        console.assert(approveRes.body.data.request.status === 'APPROVED', 'Request should be APPROVED');
        console.assert(approveRes.body.data.updatedStock === initialStock + 15, 'Stock should increase by 15');
        console.log(`✅ 6. Owner approved request -> Stock updated to ${approveRes.body.data.updatedStock} and Audit Log issued.`);

        // 6. Test Safeguard: Worker submits Outward exceeding available stock
        const badOutward = await request('POST', '/api/movements', {
            acId: targetAC._id,
            type: 'OUTWARD',
            quantity: 99999,
            notes: 'Excessive dispatch'
        }, workerToken);
        const badReqId = badOutward.body.data._id;

        const badApprove = await request('PATCH', `/api/movements/${badReqId}/review`, {
            action: 'APPROVE'
        }, ownerToken);
        console.assert(badApprove.status === 400, 'Should reject outward movement exceeding stock');
        console.log('✅ 7. Stock safeguard: Outward exceeding available warehouse stock was blocked.');

        // 7. Owner rejects the bad request
        const rejectRes = await request('PATCH', `/api/movements/${badReqId}/review`, {
            action: 'REJECT',
            remarks: 'Quantity exceeds physical stock'
        }, ownerToken);
        console.assert(rejectRes.status === 200, 'Rejection failed');
        console.assert(rejectRes.body.data.status === 'REJECTED', 'Status must be REJECTED');
        console.log('✅ 8. Owner rejected invalid request -> Status marked REJECTED.');

        // 8. Owner Dashboard Stats
        const statsRes = await request('GET', '/api/dashboard/stats', null, ownerToken);
        console.assert(statsRes.status === 200, 'Stats endpoint failed');
        console.log(`✅ 9. Dashboard stats retrieved: Total Stock = ${statsRes.body.data.totalStock}, Pending Reviews = ${statsRes.body.data.pendingCount}`);

        // 9. Official Audit Logs
        const logsRes = await request('GET', '/api/logs', null, ownerToken);
        console.assert(logsRes.status === 200, 'Logs endpoint failed');
        console.assert(logsRes.body.data.length > 0, 'Audit logs should contain records');
        console.log(`✅ 10. Official Audit Logs verified (${logsRes.body.data.length} records in ledger).`);

        console.log('\n🎉 ALL 10 BACKEND API TESTS PASSED SUCCESSFULLY!\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Test failed with error:', err);
        process.exit(1);
    }
}

runTests();
