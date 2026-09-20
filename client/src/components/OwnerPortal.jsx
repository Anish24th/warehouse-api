import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Boxes, 
  FileText, 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  X,
  PackageCheck,
  RefreshCw,
  HardHat
} from 'lucide-react';
import { api } from '../services/api';

export default function OwnerPortal({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'inventory' | 'logs'
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acs, setAcs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [acSearch, setAcSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('');

  // Modals
  const [showAddAcModal, setShowAddAcModal] = useState(false);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // New AC form state
  const [newAc, setNewAc] = useState({
    brand: '',
    modelNumber: '',
    modelName: '',
    capacity: '1.5 Ton',
    type: 'Split',
    currentStock: 0,
    price: 0,
    location: 'Aisle A - Bay 01',
    description: ''
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, acsRes, logsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getPendingMovements(),
        api.getAllACs(),
        api.getAuditLogs()
      ]);
      setStats(statsRes.data);
      setPendingRequests(pendingRes.data || []);
      setAcs(acsRes.data || []);
      setAuditLogs(logsRes.data || []);
    } catch (err) {
      showToast(err.message || 'Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Approve request and issue to logs
  const handleApprove = async (request) => {
    try {
      await api.reviewMovement(request._id, 'APPROVE', 'Verified and confirmed on dock');
      showToast(`✅ Approved! Stock updated for ${request.ac?.brand} ${request.ac?.modelNumber} and officially issued to warehouse logs.`, 'success');
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to approve request', 'error');
    }
  };

  // Open rejection modal
  const handleOpenReject = (request) => {
    setRejectModalData(request);
    setRejectionReason('');
  };

  // Submit rejection
  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectModalData) return;

    try {
      await api.reviewMovement(rejectModalData._id, 'REJECT', rejectionReason || 'Discrepancy identified during owner cross-check');
      showToast('❌ Movement request has been rejected.', 'success');
      setRejectModalData(null);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to reject request', 'error');
    }
  };

  // Create new AC model
  const handleCreateAC = async (e) => {
    e.preventDefault();
    try {
      await api.createAC(newAc);
      showToast(`AC Model ${newAc.brand} ${newAc.modelNumber} registered successfully!`, 'success');
      setShowAddAcModal(false);
      setNewAc({
        brand: '',
        modelNumber: '',
        modelName: '',
        capacity: '1.5 Ton',
        type: 'Split',
        currentStock: 0,
        price: 0,
        location: 'Aisle A - Bay 01',
        description: ''
      });
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to create AC model', 'error');
    }
  };

  // Filtered lists
  const filteredAcs = acs.filter(ac => 
    ac.brand.toLowerCase().includes(acSearch.toLowerCase()) ||
    ac.modelNumber.toLowerCase().includes(acSearch.toLowerCase()) ||
    ac.location.toLowerCase().includes(acSearch.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.brand.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.modelNumber.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.workerName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.issuedByName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.notes.toLowerCase().includes(logSearch.toLowerCase());
    
    const matchesType = !logTypeFilter || log.type === logTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Light Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem 2rem', borderRadius: '16px', marginBottom: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff1f2', color: '#e11d48', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid #fecdd3' }}>
              <ShieldCheck size={14} />
              Owner Executive Authority
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              AC Warehouse Management Dashboard
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.35rem' }}>
              Cross-check worker entry submissions, approve official movements into warehouse logs, and manage inventory stock.
            </p>
          </div>
          <button className="btn-secondary" onClick={loadAllData} style={{ alignSelf: 'center' }}>
            <RefreshCw size={15} />
            <span>Sync Live Data</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="light-stats-grid">
        <div className="light-stat-card">
          <div>
            <div className="stat-title">Total Warehouse Stock</div>
            <div className="stat-number">{stats ? stats.totalStock : '...'}</div>
            <div className="stat-subtext">Across {stats ? stats.totalModels : '...'} AC models</div>
          </div>
          <div className="stat-icon-wrapper blue">
            <Boxes size={24} />
          </div>
        </div>

        <div className="light-stat-card" style={pendingRequests.length > 0 ? { border: '2px solid #f59e0b', background: '#fffbeb' } : {}}>
          <div>
            <div className="stat-title" style={pendingRequests.length > 0 ? { color: '#b45309' } : {}}>
              Pending Cross-Checks
            </div>
            <div className="stat-number" style={pendingRequests.length > 0 ? { color: '#b45309' } : {}}>
              {pendingRequests.length}
            </div>
            <div className="stat-subtext" style={pendingRequests.length > 0 ? { color: '#d97706', fontWeight: 600 } : {}}>
              {pendingRequests.length > 0 ? '⚠️ Worker submissions waiting review' : 'All submissions clear'}
            </div>
          </div>
          <div className="stat-icon-wrapper amber">
            <Clock size={24} />
          </div>
        </div>

        <div className="light-stat-card">
          <div>
            <div className="stat-title">Inward Stock Today</div>
            <div className="stat-number" style={{ color: '#16a34a' }}>
              +{stats ? stats.inwardToday : 0}
            </div>
            <div className="stat-subtext">Verified units received</div>
          </div>
          <div className="stat-icon-wrapper green">
            <ArrowDownLeft size={24} />
          </div>
        </div>

        <div className="light-stat-card">
          <div>
            <div className="stat-title">Outward Stock Today</div>
            <div className="stat-number" style={{ color: '#0284c7' }}>
              -{stats ? stats.outwardToday : 0}
            </div>
            <div className="stat-subtext">Verified units dispatched</div>
          </div>
          <div className="stat-icon-wrapper blue">
            <ArrowUpRight size={24} />
          </div>
        </div>
      </div>

      {/* Light Tab Navigation */}
      <div className="light-tab-bar">
        <button
          className={`light-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={16} />
          <span>Cross-Check & Approval Queue</span>
          {pendingRequests.length > 0 && (
            <span className="tab-badge">{pendingRequests.length}</span>
          )}
        </button>

        <button
          className={`light-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Boxes size={16} />
          <span>Master AC Inventory ({acs.length})</span>
        </button>

        <button
          className={`light-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <FileText size={16} />
          <span>Official Issued Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING CROSS-CHECK QUEUE */}
      {activeTab === 'pending' && (
        <div className="light-panel">
          <div className="light-panel-header">
            <div>
              <div className="light-panel-title">
                <PackageCheck size={22} color="#f59e0b" />
                <span>Worker Submissions Awaiting Cross-Check</span>
              </div>
              <div className="light-panel-subtitle">
                Verify the counts recorded by floor workers. Once approved, units will be added/deducted from live inventory and stamped into official logs.
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing {pendingRequests.length} pending items
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="empty-state">
              <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#0f172a', fontWeight: 800 }}>Approval Queue Is Empty!</h3>
              <p>There are no pending worker movement submissions waiting for review.</p>
            </div>
          ) : (
            <div className="light-table-container">
              <table className="light-table">
                <thead>
                  <tr>
                    <th>Submitted</th>
                    <th>Worker</th>
                    <th>AC Model & Specs</th>
                    <th>Movement</th>
                    <th>Quantity</th>
                    <th>Current Stock ➔ Result</th>
                    <th>Worker Notes</th>
                    <th style={{ textAlign: 'center' }}>Owner Cross-Check Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(req => {
                    const currentStock = req.ac?.currentStock ?? 0;
                    const resultingStock = req.type === 'INWARD' 
                      ? currentStock + req.quantity 
                      : currentStock - req.quantity;
                    const hasStockDeficit = req.type === 'OUTWARD' && req.quantity > currentStock;

                    return (
                      <tr key={req._id}>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.825rem', color: '#64748b' }}>
                          {new Date(req.createdAt).toLocaleDateString()}<br/>
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                            <HardHat size={15} color="#0284c7" />
                            <span>{req.workerName}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.worker?.email}</div>
                        </td>
                        <td>
                          <strong>{req.ac?.brand} {req.ac?.modelNumber}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.ac?.capacity} ({req.ac?.type})</div>
                        </td>
                        <td>
                          <span className={`movement-pill ${req.type.toLowerCase()}`}>
                            {req.type === 'INWARD' ? '📥 ENTERED' : '📤 LEFT'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{req.quantity} Units</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>
                            <span>Stock: {currentStock} ➔ </span>
                            <strong style={{ color: hasStockDeficit ? '#dc2626' : (req.type === 'INWARD' ? '#16a34a' : '#0284c7') }}>
                              {resultingStock}
                            </strong>
                          </div>
                          {hasStockDeficit && (
                            <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 700 }}>
                              ⚠️ Deficit! (Only {currentStock} available)
                            </div>
                          )}
                        </td>
                        <td style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                          {req.notes || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No notes provided</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              className="btn-success"
                              onClick={() => handleApprove(req)}
                              disabled={hasStockDeficit}
                              title={hasStockDeficit ? 'Cannot approve: outward count exceeds stock' : 'Approve and issue to official warehouse logs'}
                            >
                              <CheckCircle2 size={16} />
                              <span>Approve & Issue</span>
                            </button>
                            <button
                              className="btn-danger-outline"
                              onClick={() => handleOpenReject(req)}
                              title="Reject with discrepancy reason"
                            >
                              <XCircle size={16} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER AC INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="light-panel">
          <div className="light-panel-header">
            <div>
              <div className="light-panel-title">
                <Boxes size={22} color="#e11d48" />
                <span>Master AC Inventory Directory</span>
              </div>
              <div className="light-panel-subtitle">Comprehensive catalog of all AC models, rack locations, and real-time stock balances.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  placeholder="Filter inventory..."
                  value={acSearch}
                  onChange={(e) => setAcSearch(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={() => setShowAddAcModal(true)}>
                <Plus size={16} />
                <span>Add AC Model</span>
              </button>
            </div>
          </div>

          <div className="light-table-container">
            <table className="light-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Model Number</th>
                  <th>Specs & Features</th>
                  <th>Warehouse Location</th>
                  <th>Current Stock</th>
                  <th>Unit Price (INR)</th>
                  <th>Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredAcs.map(ac => (
                  <tr key={ac._id}>
                    <td><strong>{ac.brand}</strong></td>
                    <td><code style={{ fontWeight: 700, color: '#0f172a' }}>{ac.modelNumber}</code></td>
                    <td>
                      <div>{ac.capacity} • {ac.type}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ac.modelName}</div>
                    </td>
                    <td>{ac.location}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        backgroundColor: ac.currentStock > 10 ? '#dcfce7' : (ac.currentStock > 0 ? '#fef3c7' : '#fee2e2'),
                        color: ac.currentStock > 10 ? '#15803d' : (ac.currentStock > 0 ? '#b45309' : '#b91c1c')
                      }}>
                        {ac.currentStock} Units
                      </span>
                    </td>
                    <td>₹{ac.price ? ac.price.toLocaleString('en-IN') : '—'}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{((ac.currentStock || 0) * (ac.price || 0)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL ISSUED AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="light-panel">
          <div className="light-panel-header">
            <div>
              <div className="light-panel-title">
                <FileText size={22} color="#e11d48" />
                <span>Official Issued Warehouse Logs (Ledger)</span>
              </div>
              <div className="light-panel-subtitle">
                Immutable chronological audit trail of all verified AC stock movements cross-checked and issued by warehouse authority.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={logTypeFilter}
                onChange={(e) => setLogTypeFilter(e.target.value)}
              >
                <option value="">All Movement Types</option>
                <option value="INWARD">📥 Inward Only (Entered)</option>
                <option value="OUTWARD">📤 Outward Only (Left)</option>
              </select>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2rem' }}
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="light-table-container">
            <table className="light-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>AC Model</th>
                  <th>Type</th>
                  <th>Units</th>
                  <th>Stock Progression</th>
                  <th>Issued By (Owner)</th>
                  <th>Recorded By (Worker)</th>
                  <th>Audit Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log._id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.825rem', color: '#64748b' }}>
                      {new Date(log.timestamp).toLocaleDateString()}<br/>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <strong>{log.brand} {log.modelNumber}</strong>
                    </td>
                    <td>
                      <span className={`movement-pill ${log.type.toLowerCase()}`}>
                        {log.type === 'INWARD' ? '📥 ENTERED' : '📤 LEFT'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem' }}>{log.quantity}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#64748b' }}>{log.previousStock}</span>
                      {' ➔ '}
                      <strong style={{ color: log.type === 'INWARD' ? '#16a34a' : '#0284c7' }}>
                        {log.newStock}
                      </strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#0f172a', fontWeight: 600 }}>
                        <ShieldCheck size={14} color="#f59e0b" />
                        <span>{log.issuedByName}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#475569' }}>
                        <HardHat size={14} color="#0284c7" />
                        <span>{log.workerName}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.825rem' }}>
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectModalData && (
        <div className="modal-overlay" onClick={() => setRejectModalData(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} />
                <span>Reject Worker Submission</span>
              </div>
              <button className="close-btn" onClick={() => setRejectModalData(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '0.85rem', background: '#fef2f2', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Rejecting submission from <strong>{rejectModalData.workerName}</strong> for{' '}
              <strong>{rejectModalData.quantity} units</strong> of{' '}
              <strong>{rejectModalData.ac?.brand} {rejectModalData.ac?.modelNumber}</strong> ({rejectModalData.type}).
            </div>

            <form onSubmit={handleSubmitReject}>
              <div className="form-group">
                <label className="form-label">Discrepancy / Rejection Reason</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  placeholder="e.g. Physical count discrepancy on dock: counted 10 units instead of 15; Truck driver damaged box #4..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setRejectModalData(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW AC MODEL MODAL */}
      {showAddAcModal && (
        <div className="modal-overlay" onClick={() => setShowAddAcModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Register New AC Model</div>
              <button className="close-btn" onClick={() => setShowAddAcModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAC}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">AC Brand</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Daikin, Voltas, LG, Carrier"
                    value={newAc.brand}
                    onChange={(e) => setNewAc({ ...newAc, brand: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Model Number / SKU</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. FTKM50U"
                    value={newAc.modelNumber}
                    onChange={(e) => setNewAc({ ...newAc, modelNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Model Description / Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1.5 Ton 5-Star Inverter Split AC"
                  value={newAc.modelName}
                  onChange={(e) => setNewAc({ ...newAc, modelName: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Cooling Capacity</label>
                  <select
                    className="form-select"
                    value={newAc.capacity}
                    onChange={(e) => setNewAc({ ...newAc, capacity: e.target.value })}
                  >
                    <option value="1.0 Ton">1.0 Ton</option>
                    <option value="1.5 Ton">1.5 Ton</option>
                    <option value="2.0 Ton">2.0 Ton</option>
                    <option value="2.5 Ton">2.5 Ton</option>
                    <option value="3.0 Ton (Commercial)">3.0 Ton (Commercial)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">AC Type</label>
                  <select
                    className="form-select"
                    value={newAc.type}
                    onChange={(e) => setNewAc({ ...newAc, type: e.target.value })}
                  >
                    <option value="Split">Split AC</option>
                    <option value="Window">Window AC</option>
                    <option value="Cassette">Cassette AC</option>
                    <option value="Tower">Tower AC</option>
                    <option value="Portable">Portable AC</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Initial Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={newAc.currentStock}
                    onChange={(e) => setNewAc({ ...newAc, currentStock: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (INR)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="e.g. 38500"
                    value={newAc.price}
                    onChange={(e) => setNewAc({ ...newAc, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Rack / Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Aisle B - Bay 04"
                  value={newAc.location}
                  onChange={(e) => setNewAc({ ...newAc, location: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddAcModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save AC Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
