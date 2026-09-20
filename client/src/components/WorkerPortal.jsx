import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Package, 
  Send, 
  Boxes,
  HardHat,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function WorkerPortal({ user, showToast }) {
  const [acs, setAcs] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('entry'); // 'entry' | 'history' | 'catalog'
  const [loadingAcs, setLoadingAcs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [selectedAcId, setSelectedAcId] = useState('');
  const [movementType, setMovementType] = useState('INWARD'); // 'INWARD' or 'OUTWARD'
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Fetch ACs and Worker Submissions
  const fetchData = async () => {
    try {
      setLoadingAcs(true);
      const [acsRes, mySubsRes] = await Promise.all([
        api.getAllACs(),
        api.getMyMovements()
      ]);
      setAcs(acsRes.data || []);
      setMySubmissions(mySubsRes.data || []);
      if (acsRes.data && acsRes.data.length > 0 && !selectedAcId) {
        setSelectedAcId(acsRes.data[0]._id);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch warehouse data', 'error');
    } finally {
      setLoadingAcs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedAC = acs.find(a => a._id === selectedAcId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAcId) {
      showToast('Please select an AC Model', 'error');
      return;
    }
    if (quantity <= 0) {
      showToast('Quantity must be greater than 0', 'error');
      return;
    }

    if (movementType === 'OUTWARD' && selectedAC && quantity > selectedAC.currentStock) {
      const proceed = window.confirm(
        `⚠️ Warning: You are requesting to dispatch ${quantity} units, but only ${selectedAC.currentStock} units are recorded in stock. Submit anyway for Owner inspection?`
      );
      if (!proceed) return;
    }

    setSubmitting(true);
    try {
      await api.createMovement({
        acId: selectedAcId,
        type: movementType,
        quantity: parseInt(quantity, 10),
        notes
      });

      showToast(`Submitted: ${quantity} units of ${selectedAC?.brand} ${selectedAC?.modelNumber} (${movementType}). Awaiting Owner verification.`, 'success');
      
      setQuantity(1);
      setNotes('');
      fetchData();
      setActiveTab('history');
    } catch (err) {
      showToast(err.message || 'Error submitting movement request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStepQuantity = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const filteredAcs = acs.filter(ac => 
    ac.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ac.modelNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ac.capacity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Light Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem 2rem', borderRadius: '16px', marginBottom: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid #bae6fd' }}>
              <HardHat size={14} />
              Floor Worker Operations Portal
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Log AC Stock Movements (Entered & Left)
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.35rem' }}>
              Record AC stock arriving at the warehouse or being dispatched. The owner will cross-check and issue your entries into the official warehouse logs.
            </p>
          </div>
          <button className="btn-secondary" onClick={fetchData} style={{ alignSelf: 'center' }}>
            <RefreshCw size={15} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="light-tab-bar">
        <button
          className={`light-tab-btn ${activeTab === 'entry' ? 'active' : ''}`}
          onClick={() => setActiveTab('entry')}
        >
          <Send size={16} />
          <span>New Movement Entry</span>
        </button>
        <button
          className={`light-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={16} />
          <span>My Submissions ({mySubmissions.length})</span>
        </button>
        <button
          className={`light-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <Boxes size={16} />
          <span>Warehouse AC Directory ({acs.length})</span>
        </button>
      </div>

      {/* TAB 1: NEW MOVEMENT ENTRY */}
      {activeTab === 'entry' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
          {/* Main Form */}
          <div className="light-panel">
            <div className="light-panel-header">
              <div>
                <div className="light-panel-title">
                  <Package size={20} color="#e11d48" />
                  <span>Record AC Stock Entry / Exit</span>
                </div>
                <div className="light-panel-subtitle">Select the AC model and specify how many units entered or left.</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Select Model */}
              <div className="form-group">
                <label className="form-label">Select AC Brand & Model</label>
                <select
                  className="form-select"
                  value={selectedAcId}
                  onChange={(e) => setSelectedAcId(e.target.value)}
                  required
                >
                  <option value="">-- Choose AC Model --</option>
                  {acs.map(ac => (
                    <option key={ac._id} value={ac._id}>
                      {ac.brand} {ac.modelNumber} - {ac.capacity} ({ac.type}) [Stock: {ac.currentStock} units]
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Inward or Outward Pill Selector */}
              <div className="form-group">
                <label className="form-label">Movement Direction</label>
                <div className="movement-toggle-grid">
                  <div
                    className={`toggle-pill ${movementType === 'INWARD' ? 'selected-inward' : ''}`}
                    onClick={() => setMovementType('INWARD')}
                  >
                    <div style={{ background: '#dcfce7', padding: '10px', borderRadius: '8px', color: '#15803d' }}>
                      <ArrowDownLeft size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: movementType === 'INWARD' ? '#15803d' : '#0f172a' }}>
                        📥 Stock ENTERED (Inward)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Arrived from factory or supplier</div>
                    </div>
                  </div>

                  <div
                    className={`toggle-pill ${movementType === 'OUTWARD' ? 'selected-outward' : ''}`}
                    onClick={() => setMovementType('OUTWARD')}
                  >
                    <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '8px', color: '#0369a1' }}>
                      <ArrowUpRight size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: movementType === 'OUTWARD' ? '#0284c7' : '#0f172a' }}>
                        📤 Stock LEFT (Outward)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Dispatched to showroom or customer</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Quantity with Quick Steppers */}
              <div className="form-group">
                <label className="form-label">Number of AC Units ({movementType === 'INWARD' ? 'Entering' : 'Leaving'})</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    style={{ maxWidth: '160px', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }} onClick={() => handleStepQuantity(1)}>+1</button>
                    <button type="button" className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }} onClick={() => handleStepQuantity(5)}>+5</button>
                    <button type="button" className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }} onClick={() => handleStepQuantity(10)}>+10</button>
                    <button type="button" className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }} onClick={() => handleStepQuantity(25)}>+25</button>
                  </div>
                </div>
              </div>

              {/* Step 4: Notes */}
              <div className="form-group">
                <label className="form-label">Shipment Details / Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="e.g. Delivery truck MH-04-1234, Shipment batch #DK-8821, client invoice #INV-4902"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
                disabled={submitting || !selectedAcId}
              >
                <Send size={18} />
                <span>{submitting ? 'Submitting to Owner...' : 'Submit to Owner for Cross-Check'}</span>
              </button>
            </form>
          </div>

          {/* Model Information Card Sidebar */}
          <div>
            {selectedAC ? (
              <div className="light-panel" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Selected AC Details
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {selectedAC.brand} {selectedAC.modelNumber}
                </h3>
                <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {selectedAC.modelName || 'Standard Warehouse Model'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Capacity:</span>
                    <strong>{selectedAC.capacity}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Type:</span>
                    <strong>{selectedAC.type}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b' }}>Warehouse Location:</span>
                    <strong>{selectedAC.location}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#e0f2fe', borderRadius: '8px', color: '#0369a1', marginTop: '0.5rem' }}>
                    <span>Current In-Stock:</span>
                    <strong style={{ fontSize: '1.15rem' }}>{selectedAC.currentStock} Units</strong>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.8rem', color: '#92400e' }}>
                  💡 <strong>Note for Floor Workers:</strong> When you submit this entry, the warehouse count will NOT change immediately. It will be verified and approved by the owner first.
                </div>
              </div>
            ) : (
              <div className="light-panel" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 1rem' }}>
                <Package size={40} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>Select an AC model to view its specifications and available warehouse stock.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY SUBMISSIONS */}
      {activeTab === 'history' && (
        <div className="light-panel">
          <div className="light-panel-header">
            <div>
              <div className="light-panel-title">
                <Clock size={20} color="#e11d48" />
                <span>My Movement Submissions</span>
              </div>
              <div className="light-panel-subtitle">Track the verification status of entries you submitted to the owner.</div>
            </div>
            <button className="btn-secondary" onClick={fetchData}>
              <RefreshCw size={14} />
              <span>Refresh List</span>
            </button>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="empty-state">
              <Package size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#0f172a', fontWeight: 800 }}>No Submissions Found</h3>
              <p>You have not logged any AC movements yet.</p>
            </div>
          ) : (
            <div className="light-table-container">
              <table className="light-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>AC Model</th>
                    <th>Movement</th>
                    <th>Units</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th>Verification Details</th>
                  </tr>
                </thead>
                <tbody>
                  {mySubmissions.map(item => (
                    <tr key={item._id}>
                      <td style={{ whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.825rem' }}>
                        {new Date(item.createdAt).toLocaleDateString()}<br/>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <strong>{item.ac?.brand} {item.ac?.modelNumber}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.ac?.capacity}</div>
                      </td>
                      <td>
                        <span className={`movement-pill ${item.type.toLowerCase()}`}>
                          {item.type === 'INWARD' ? '📥 ENTERED' : '📤 LEFT'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.05rem' }}>{item.quantity}</strong>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
                        {item.notes || '—'}
                      </td>
                      <td>
                        <span className={`status-pill ${item.status.toLowerCase()}`}>
                          {item.status === 'PENDING' && <><Clock size={12} /> Pending Verification</>}
                          {item.status === 'APPROVED' && <><CheckCircle2 size={12} /> Approved & Logged</>}
                          {item.status === 'REJECTED' && <><XCircle size={12} /> Rejected</>}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {item.status === 'APPROVED' && (
                          <span style={{ color: '#047857', fontWeight: 600 }}>Verified by {item.reviewedByName || 'Owner'}</span>
                        )}
                        {item.status === 'REJECTED' && (
                          <span style={{ color: '#b91c1c', fontWeight: 600 }}>Reason: {item.rejectionReason || 'Discrepancy'}</span>
                        )}
                        {item.status === 'PENDING' && (
                          <span style={{ color: '#94a3b8' }}>Awaiting Owner Review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATALOG & STOCK LOOKUP */}
      {activeTab === 'catalog' && (
        <div className="light-panel">
          <div className="light-panel-header">
            <div>
              <div className="light-panel-title">
                <Boxes size={20} color="#e11d48" />
                <span>Warehouse AC Directory & Stock</span>
              </div>
              <div className="light-panel-subtitle">Reference guide for warehouse stock and floor storage locations.</div>
            </div>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem' }}
                placeholder="Search brand, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="light-table-container">
            <table className="light-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Model Number</th>
                  <th>Specs</th>
                  <th>Warehouse Location</th>
                  <th>Available Stock</th>
                </tr>
              </thead>
              <tbody>
                {filteredAcs.map(ac => (
                  <tr key={ac._id}>
                    <td><strong>{ac.brand}</strong></td>
                    <td><code style={{ fontWeight: 700, color: '#0f172a' }}>{ac.modelNumber}</code></td>
                    <td>
                      <div>{ac.capacity} - {ac.type}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{ac.modelName}</div>
                    </td>
                    <td>{ac.location}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        backgroundColor: ac.currentStock > 10 ? '#dcfce7' : (ac.currentStock > 0 ? '#fef3c7' : '#fee2e2'),
                        color: ac.currentStock > 10 ? '#15803d' : (ac.currentStock > 0 ? '#b45309' : '#b91c1c')
                      }}>
                        {ac.currentStock} Units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
