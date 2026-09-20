import React, { useState } from 'react';
import { 
  Wind, 
  ShieldCheck, 
  HardHat, 
  CheckCircle2, 
  LogIn, 
  UserPlus, 
  Building2, 
  Cloud, 
  Sparkles, 
  Eye, 
  AlertCircle
} from 'lucide-react';
import { api, setAuthToken, setStoredUser } from '../services/api';

export default function SignInPage({ onLoginSuccess, onEnterGuest, showToast }) {
  // Sub-interface selection: 'owner' | 'worker'
  const [selectedRole, setSelectedRole] = useState('owner');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        if (selectedRole === 'worker') {
          throw new Error('Worker accounts can only be created by the Warehouse Owner.');
        }
        res = await api.register({
          ...formData,
          role: 'owner'
        });
        showToast(`Owner account registered! Welcome, ${res.user.name}`, 'success');
      } else {
        res = await api.login(formData.email, formData.password);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
      }

      setAuthToken(res.token);
      setStoredUser(res.user);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    const email = role === 'owner' ? 'owner@warehouse.com' : 'worker1@warehouse.com';
    const password = role === 'owner' ? 'owner123' : 'worker123';

    try {
      const res = await api.login(email, password);
      setAuthToken(res.token);
      setStoredUser(res.user);
      showToast(`Signed in as ${role === 'owner' ? '👑 Owner' : '👷 Floor Worker'} (${res.user.name})`, 'success');
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Quick sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.guestLogin();
      setAuthToken(res.token);
      setStoredUser(res.user);
      showToast('Entered as Guest Explorer. Viewing AC models & stock.', 'success');
      onLoginSuccess(res.user);
    } catch (err) {
      showToast('Error entering guest mode', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Public Landing Navbar */}
      <header className="navbar-light">
        <div className="nav-brand-group">
          <div className="nav-brand">
            <div className="brand-icon">
              <Wind size={22} color="#ffffff" />
            </div>
            <div>
              <div className="brand-title">AC Warehouse</div>
              <div className="brand-subtitle">Warehouse Inventory Software</div>
            </div>
          </div>

          <div className="nav-links" style={{ marginLeft: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Home</span>
            <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>›</span>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Inventory Management</span>
            <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>›</span>
            <span style={{ fontSize: '0.9rem', color: '#e11d48', fontWeight: 700 }}>AC Warehouse</span>
          </div>
        </div>

        <div className="nav-right-actions">
          {/* Guest Portal Entry Button */}
          <button 
            className="btn-secondary"
            onClick={handleGuestEntry}
            disabled={loading}
            title="Browse available AC models as public guest"
          >
            <Eye size={15} color="#0284c7" />
            <span>Browse as Guest</span>
          </button>

          <button 
            className="btn-primary"
            style={{ padding: '0.55rem 1rem', fontSize: '0.875rem' }}
            onClick={() => {
              const el = document.getElementById('signin-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <LogIn size={15} />
            <span>Sign In Portal</span>
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="main-content" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="landing-hero-grid">
          
          {/* Left Column: SaaS Hero Pitch */}
          <div>
            <div className="hero-pill-badge">
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e11d48' }}></span>
              Trusted by 1.5 Crore+ Businesses
            </div>

            <h1 className="hero-title">
              Warehouse Inventory<br />
              <span>Software</span>
            </h1>

            <p className="hero-description">
              Take complete control of your AC warehouse inventory. Track stock across every godown, 
              record inward and outward movement with proof, monitor daily & monthly sales, and cross-check 
              profit margins with real-time audit reports.
            </p>

            <div className="feature-tag-list">
              <div className="feature-pill-tag">
                <CheckCircle2 size={16} color="#059669" />
                <span>Real Time Stock Tracking</span>
              </div>
              <div className="feature-pill-tag">
                <CheckCircle2 size={16} color="#059669" />
                <span>Owner Cross-Check Desk</span>
              </div>
              <div className="feature-pill-tag">
                <CheckCircle2 size={16} color="#059669" />
                <span>Proof of Movement Verification</span>
              </div>
              <div className="feature-pill-tag">
                <CheckCircle2 size={16} color="#059669" />
                <span>&lt; 10% Profit Margin Alert</span>
              </div>
              <div className="feature-pill-tag">
                <CheckCircle2 size={16} color="#059669" />
                <span>Guest Catalog (100+ Users)</span>
              </div>
            </div>

            <div className="trust-badges-row">
              <div className="trust-badge-item">
                <Building2 size={16} color="#e11d48" />
                <span>Built for Indian AC Warehouses</span>
              </div>
              <div className="trust-badge-item">
                <Cloud size={16} color="#0284c7" />
                <span>Works Offline & Cloud Sync</span>
              </div>
              <div className="trust-badge-item">
                <Sparkles size={16} color="#d97706" />
                <span>Owner-Assigned Staff</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sub-Interface Sign-In Desk */}
          <div id="signin-card" className="signin-card-container">
            <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                {isRegister ? 'Register Warehouse Owner' : 'Warehouse Portal Sign-In'}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                Select your designated sub-interface below to get started
              </div>
            </div>

            {/* Role Sub-Interface Selector Tabs */}
            <div className="signin-tab-group">
              <button
                type="button"
                className={`signin-tab-btn ${selectedRole === 'owner' ? 'active' : ''}`}
                onClick={() => { setSelectedRole('owner'); setError(''); }}
              >
                <ShieldCheck size={18} />
                <span>Owner Portal</span>
              </button>

              <button
                type="button"
                className={`signin-tab-btn ${selectedRole === 'worker' ? 'active' : ''}`}
                onClick={() => { setSelectedRole('worker'); setIsRegister(false); setError(''); }}
              >
                <HardHat size={18} />
                <span>Worker Portal</span>
              </button>
            </div>

            {/* Sub-Interface Context Banner */}
            <div className="sub-interface-desc">
              {selectedRole === 'owner' ? (
                <>
                  <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Owner Authority:</strong> Review & cross-check worker submissions, assign staff, and access sales analytics.
                  </span>
                </>
              ) : (
                <>
                  <HardHat size={18} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Floor Worker:</strong> Log movements with mandatory proof and check profit margins.
                  </span>
                </>
              )}
            </div>

            {/* One-Click Demo Access Box */}
            <div className="demo-login-box">
              <div className="demo-login-header">
                ⚡ Quick Demo Sign-In
              </div>
              <div className="demo-btn-grid">
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ justifyContent: 'center', borderColor: selectedRole === 'owner' ? '#f59e0b' : '#38bdf8', color: selectedRole === 'owner' ? '#b45309' : '#0284c7', background: selectedRole === 'owner' ? '#fffbeb' : '#f0f9ff' }}
                  onClick={() => handleQuickDemoLogin(selectedRole)}
                  disabled={loading}
                >
                  {selectedRole === 'owner' ? <ShieldCheck size={16} /> : <HardHat size={16} />}
                  <span>Sign In as {selectedRole === 'owner' ? 'Rajesh Sharma (Owner)' : 'Amit Kumar (Worker)'}</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ justifyContent: 'center', borderColor: '#cbd5e1', color: '#475569', background: '#f8fafc' }}
                  onClick={handleGuestEntry}
                  disabled={loading}
                >
                  <Eye size={16} color="#0284c7" />
                  <span>Browse AC Catalog as Guest (No Password)</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="alert-box error" style={{ padding: '0.65rem 0.85rem' }}>
                <span>{error}</span>
              </div>
            )}

            {/* Worker Notice if attempting self-registration */}
            {selectedRole === 'worker' && isRegister ? (
              <div style={{ padding: '1.25rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', color: '#92400e', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '0.35rem' }}>
                  <AlertCircle size={16} color="#b45309" />
                  <span>Worker Logins are Assigned by Owner</span>
                </div>
                Workers cannot self-register by will. Please contact the Warehouse Owner (Manager) to obtain your login email and temporary password.
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    onClick={() => setIsRegister(false)}
                  >
                    Back to Worker Sign In
                  </button>
                </div>
              </div>
            ) : (
              /* Main Form */
              <form onSubmit={handleSubmit}>
                {isRegister && selectedRole === 'owner' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Rajesh Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder={selectedRole === 'owner' ? 'owner@warehouse.com' : 'worker1@warehouse.com'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                  disabled={loading}
                >
                  {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                  <span>
                    {loading ? 'Processing...' : (isRegister ? 'Register as Warehouse Owner' : `Sign In to ${selectedRole.toUpperCase()} Portal`)}
                  </span>
                </button>
              </form>
            )}

            {/* Registration toggle for Owner only */}
            {selectedRole === 'owner' && (
              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                {isRegister ? (
                  <span>
                    Already an Owner?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsRegister(false); setError(''); }}
                      style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    Need to register a new Warehouse Owner?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsRegister(true); setError(''); }}
                      style={{ background: 'none', border: 'none', color: '#e11d48', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Create Owner Account
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1.25rem 2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.825rem' }}>
        © 2026 AC Warehouse Inventory System. Simple, fast warehouse stock tracking with owner cross-check authority.
      </footer>
    </div>
  );
}
