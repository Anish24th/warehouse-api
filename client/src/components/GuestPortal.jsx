import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  HelpCircle, 
  MessageSquarePlus, 
  LogOut, 
  Package, 
  Tag, 
  Building, 
  CheckCircle2, 
  X,
  Send,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function GuestPortal({ user, onExitGuest, showToast }) {
  const [acs, setAcs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  // Issue modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueData, setIssueData] = useState({
    title: '',
    description: '',
    category: 'Stock Inquiry',
    urgency: 'Low',
    reportedBy: 'Guest Explorer',
    reportedByEmail: ''
  });
  const [submittingIssue, setSubmittingIssue] = useState(false);

  const fetchACs = async () => {
    try {
      setLoading(true);
      const res = await api.getAllACs();
      setAcs(res.data || []);
    } catch (err) {
      showToast(err.message || 'Error loading AC models', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchACs();
  }, []);

  const handleReportIssue = async (e) => {
    e.preventDefault();
    setSubmittingIssue(true);
    try {
      await api.createIssue(issueData);
      showToast('Your inquiry/report has been submitted to the Warehouse Owner feed!', 'success');
      setShowIssueModal(false);
      setIssueData({
        title: '',
        description: '',
        category: 'Stock Inquiry',
        urgency: 'Low',
        reportedBy: 'Guest Explorer',
        reportedByEmail: ''
      });
    } catch (err) {
      showToast(err.message || 'Failed to submit inquiry', 'error');
    } finally {
      setSubmittingIssue(false);
    }
  };

  const brands = Array.from(new Set(acs.map(a => a.brand))).filter(Boolean);

  const filteredAcs = acs.filter(ac => {
    const matchesSearch = 
      ac.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.modelNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.capacity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.modelName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = !brandFilter || ac.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  const totalUnits = acs.reduce((sum, item) => sum + (item.currentStock || 0), 0);

  return (
    <div>
      {/* Light Banner */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem 2rem', borderRadius: '16px', marginBottom: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid #cbd5e1' }}>
              <Tag size={13} />
              Public Guest Explorer Mode (100+ User Scale)
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Explore Available AC Models & Stock
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.35rem' }}>
              View live stock availability, technical tonnage capacities, and warehouse rack locations across all brands.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={() => setShowIssueModal(true)}>
              <MessageSquarePlus size={16} color="#e11d48" />
              <span>Report Issue / Ask Question</span>
            </button>
            <button className="btn-signout" onClick={onExitGuest}>
              <LogOut size={15} />
              <span>Exit Guest Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="light-stats-grid">
        <div className="light-stat-card">
          <div>
            <div className="stat-title">Distinct AC Models</div>
            <div className="stat-number">{acs.length} Models</div>
            <div className="stat-subtext">Across {brands.length} major brands</div>
          </div>
          <div className="stat-icon-wrapper blue">
            <Boxes size={24} />
          </div>
        </div>

        <div className="light-stat-card">
          <div>
            <div className="stat-title">Total Units Available</div>
            <div className="stat-number" style={{ color: '#16a34a' }}>
              {totalUnits} Units
            </div>
            <div className="stat-subtext">Verified in-stock inventory</div>
          </div>
          <div className="stat-icon-wrapper green">
            <Package size={24} />
          </div>
        </div>

        <div className="light-stat-card">
          <div>
            <div className="stat-title">Warehouse Godown</div>
            <div className="stat-number" style={{ fontSize: '1.5rem', color: '#0f172a' }}>
              Godown A Hub
            </div>
            <div className="stat-subtext">Central Distribution Facility</div>
          </div>
          <div className="stat-icon-wrapper rose">
            <Building size={24} />
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="light-panel">
        <div className="light-panel-header">
          <div>
            <div className="light-panel-title">
              <Boxes size={22} color="#e11d48" />
              <span>AC Model Inventory Directory</span>
            </div>
            <div className="light-panel-subtitle">
              Showing {filteredAcs.length} models matching your filter criteria.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              <option value="">All Brands ({brands.length})</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem' }}
                placeholder="Search model, brand, ton..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="light-table-container">
          <table className="light-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Model Number</th>
                <th>Tonnage & Type</th>
                <th>Model Description</th>
                <th>Location</th>
                <th>Stock Status</th>
                <th>Approx Retail Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredAcs.map(ac => (
                <tr key={ac._id}>
                  <td><strong>{ac.brand}</strong></td>
                  <td><code style={{ fontWeight: 800, color: '#0f172a' }}>{ac.modelNumber}</code></td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{ac.capacity}</span> • {ac.type}
                  </td>
                  <td style={{ maxWidth: '260px', color: '#475569', fontSize: '0.825rem' }}>
                    {ac.modelName || ac.description || 'Standard Manufacturer Specs'}
                  </td>
                  <td>{ac.location}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      backgroundColor: ac.currentStock > 10 ? '#dcfce7' : (ac.currentStock > 0 ? '#fef3c7' : '#fee2e2'),
                      color: ac.currentStock > 10 ? '#15803d' : (ac.currentStock > 0 ? '#b45309' : '#b91c1c')
                    }}>
                      {ac.currentStock} In Stock
                    </span>
                  </td>
                  <td>
                    <strong>₹{ac.price ? ac.price.toLocaleString('en-IN') : '—'}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Issue / Feedback Modal */}
      {showIssueModal && (
        <div className="modal-overlay" onClick={() => setShowIssueModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquarePlus size={20} color="#e11d48" />
                <span>Report Problem or Stock Inquiry</span>
              </div>
              <button className="close-btn" onClick={() => setShowIssueModal(false)}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Your inquiry or bug report will be instantly dispatched to the Warehouse Owner's active incident feed.
            </p>

            <form onSubmit={handleReportIssue}>
              <div className="form-group">
                <label className="form-label">Subject / Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Bulk stock availability question for Daikin 1.5T"
                  value={issueData.title}
                  onChange={(e) => setIssueData({ ...issueData, title: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={issueData.category}
                    onChange={(e) => setIssueData({ ...issueData, category: e.target.value })}
                  >
                    <option value="Stock Inquiry">Stock Inquiry</option>
                    <option value="App Glitch">App Glitch / Bug</option>
                    <option value="General">General Question</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Email (Optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@domain.com"
                    value={issueData.reportedByEmail}
                    onChange={(e) => setIssueData({ ...issueData, reportedByEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  placeholder="Describe your question or issue in detail..."
                  value={issueData.description}
                  onChange={(e) => setIssueData({ ...issueData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowIssueModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingIssue}
                >
                  <Send size={16} />
                  <span>{submittingIssue ? 'Sending...' : 'Send to Owner Feed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
