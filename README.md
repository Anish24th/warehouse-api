# ❄️ AC Warehouse Management System (MERN Stack)

A full-stack **MERN** (MongoDB, Express.js, React 19, Node.js) Warehouse Management application designed specifically for Air Conditioner (AC) inventory logistics, stock tracking, worker floor entries, and owner cross-checking with immutable audit logging.

---

## 🎯 Key Features & Dual-Interface Architecture

### 👷 1. Floor Worker Interface
- **Quick Movement Logging**: Floor workers can select AC brand & model, specify movement type:
  - 📥 **Stock ENTERED (Inward)**: Units arrived from supplier or factory shipment.
  - 📤 **Stock LEFT (Outward)**: Units dispatched to retailers, customers, or transfers.
- **Quantity Stepper**: Direct integer input plus rapid increments (`+1`, `+5`, `+10`, `+25`).
- **Shipment Notes**: Record delivery truck plates, invoice numbers, or batch IDs.
- **Real-Time Submission Tracking**: Workers can view their personal submissions with live status badges:
  - ⏳ `Pending Verification`
  - ✅ `Approved & Logged`
  - ❌ `Rejected` (includes the owner's explanation if there is a discrepancy).
- **Warehouse AC Directory**: Quick reference view of all AC specs, capacities, and warehouse rack locations.

### 👑 2. Owner Executive & Verification Interface
- **Authentication & Authority**: Strictly secured by credential authentication (JWT with bcrypt password hashing).
- **Executive KPI Dashboard**:
  - Total AC Units in Stock across all models
  - Real-time count of pending submissions awaiting review
  - Inward units received today
  - Outward units dispatched today
- **Cross-Check & Approval Queue**:
  - Review worker submissions with worker identity, model specs, movement direction, requested units, and worker notes.
  - Live stock projection: Shows current stock ➔ preview of resulting stock.
  - **"Approve & Issue to Logs"** (One Click): Atomically updates warehouse stock in real-time and stamps an entry into the official warehouse logs.
  - **"Reject"**: Allows the owner to reject inaccurate counts with custom notes (e.g. "Physical count on dock was 8, not 12").
  - **Stock Safeguard**: Prevents outward dispatch approvals that exceed available warehouse inventory.
- **Master AC Inventory Management**:
  - Live stock table with Brand, Model Number, Type (Split/Window/Cassette), Capacity (Tonnage), Rack Location, Unit Price, and Valuation.
  - **"+ Add AC Model"**: Register new AC models into the warehouse system.
- **Official Issued Audit Logs (Ledger)**:
  - Permanent immutable chronological ledger of all verified movements.
  - Filterable by type (Inward / Outward) and searchable by model, worker, or owner.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v26)
- **MongoDB**: Local MongoDB daemon running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string.

### 2. Environment Setup
The backend reads environment variables from `.env`:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/ac_warehouse
JWT_SECRET=supersecret_ac_warehouse_jwt_key_2026
NODE_ENV=development
```

### 3. Seed Sample Data
Initialize sample AC models (Daikin, Voltas, LG, Carrier, Blue Star, Hitachi) and predefined accounts:
```bash
npm run seed
```

### 4. Run the Application
Start the backend server (serves the built React client directly on port `5001`):
```bash
npm start
```
Open **[http://localhost:5001](http://localhost:5001)** in your browser.

#### Optional: Frontend Hot-Reload Development Server
To develop the frontend with Vite Hot Module Replacement (HMR):
```bash
npm run client:dev
```
Open **[http://localhost:5173](http://localhost:5173)**. All API calls automatically proxy to port `5001`.

---

## 🔑 Pre-Configured Demo Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **👑 Owner** | Rajesh Sharma | `owner@warehouse.com` | `owner123` |
| **👷 Worker 1** | Amit Kumar | `worker1@warehouse.com` | `worker123` |
| **👷 Worker 2** | Sunil Verma | `worker2@warehouse.com` | `worker123` |

> 💡 *Tip: You can also use the **"Switch to Worker / Owner"** button on the navbar to instantly toggle between roles and test the cross-check flow!*

---

## 🧪 Automated Testing
Run the backend test suite covering authentication, stock safeguards, worker submissions, and owner approvals:
```bash
npm test
```

---

## 📂 Project Structure

```
AC-Warehouse/
├── config/
│   └── database.js            # MongoDB Mongoose connection
├── controllers/
│   ├── acController.js        # AC Inventory CRUD
│   ├── authController.js      # User registration & login (JWT)
│   ├── dashboardController.js # Warehouse KPI metrics
│   ├── logController.js       # Official audit log ledger
│   └── movementController.js  # Worker movement requests & owner review
├── models/
│   ├── AC.js                  # AC model schema & inventory counts
│   ├── AuditLog.js            # Immutable verified log records
│   ├── MovementRequest.js     # Pending/reviewed worker submissions
│   └── User.js                # User accounts & roles (owner / worker)
├── middleware/
│   └── auth.js                # JWT token & role authorization middleware
├── routes/
│   ├── acRoutes.js            # /api/ac
│   ├── authRoutes.js          # /api/auth
│   ├── dashboardRoutes.js     # /api/dashboard
│   ├── logRoutes.js           # /api/logs
│   └── movementRoutes.js      # /api/movements
├── tests/
│   └── api_test.js            # End-to-end automated test script
├── client/                    # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginModal.jsx   # Auth modal with quick demo logins
│   │   │   ├── Navbar.jsx       # Header with role badges & quick switch
│   │   │   ├── OwnerPortal.jsx  # Approval queue, inventory, audit logs
│   │   │   └── WorkerPortal.jsx # Inward/outward entry desk & submissions
│   │   ├── services/
│   │   │   └── api.js           # Central API client
│   │   ├── App.jsx              # Main app controller
│   │   └── index.css            # Custom responsive warehouse UI system
│   └── vite.config.js         # Vite proxy configuration
├── seed.js                    # Database seeder
├── server.js                  # Express 5 server
└── package.json
```
