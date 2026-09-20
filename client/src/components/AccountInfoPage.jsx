import React from 'react';
import { 
  ShieldCheck, 
  HardHat, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  Lock, 
  Key, 
  ArrowLeft, 
  LogOut, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export default function AccountInfoPage({ user, onBackToDashboard, onLogout }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isOwner = user.role === 'owner';

  return (
    <div>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <button className="btn-secondary" onClick={onBackToDashboard}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <button className="btn-signout" onClick={onLogout}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Hero Profile Card */}
      <div className="account-hero-card">
        <div className="account-profile-main">
          <div className="account-big-avatar">
            {getInitials(user.name)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {user.name}
              </h1>
              <div className={`role-badge-light ${user.role}`}>
                {isOwner ? (
                  <>
                    <ShieldCheck size={14} />
                    <span>OWNER (Admin)</span>
                  </>
                ) : (
                  <>
                    <HardHat size={14} />
                    <span>FLOOR WORKER</span>
                  </>
                )}
              </div>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
              {isOwner ? 'Warehouse Facility General Manager & Inventory Authority' : 'Warehouse Operations Specialist & Inventory Logger'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Godown Assignment</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Godown A (Central AC Hub)</div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
            <CheckCircle2 size={13} />
            <span>Active Operator</span>
          </div>
        </div>
      </div>

      {/* Grid of Details Cards */}
      <div className="account-grid-cards">
        
        {/* Card 1: Personal & Contact Information */}
        <div className="light-panel">
          <div className="light-panel-title" style={{ marginBottom: '1rem' }}>
            <User size={20} color="#e11d48" />
            <span>Profile Details</span>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>Full Name:</span>
            <strong>{user.name}</strong>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>Email Address:</span>
            <strong>{user.email}</strong>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>Contact Phone:</span>
            <strong>{user.phone || '+91 98765 43210 (Default)'}</strong>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>System Role:</span>
            <span style={{ textTransform: 'capitalize', fontWeight: 700, color: isOwner ? '#b45309' : '#0369a1' }}>
              {user.role}
            </span>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>Member Since:</span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Card 2: Role Authority & Permissions */}
        <div className="light-panel">
          <div className="light-panel-title" style={{ marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="#e11d48" />
            <span>Warehouse Authority & Access</span>
          </div>

          {isOwner ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span><strong>Cross-Check Authority:</strong> Review and verify all worker submissions.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span><strong>Issue Official Logs:</strong> Commit verified inward/outward movements into ledger.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span><strong>Master Inventory Control:</strong> Register, update, and manage AC models and racks.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span><strong>Financial Valuation:</strong> Access inventory valuation and stock metrics.</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1' }}>
                <CheckCircle2 size={16} color="#0284c7" />
                <span><strong>Movement Logging:</strong> Record AC units entering or leaving warehouse.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1' }}>
                <CheckCircle2 size={16} color="#0284c7" />
                <span><strong>Submission Tracker:</strong> View real-time pending, approved, and rejected records.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1' }}>
                <CheckCircle2 size={16} color="#0284c7" />
                <span><strong>AC Catalog Lookup:</strong> Access warehouse specifications and storage locations.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', background: '#fffbeb', padding: '0.5rem', borderRadius: '6px' }}>
                <AlertCircle size={16} color="#d97706" />
                <span>Note: Submissions must be approved by the Owner before stock updates.</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Security & Session Info */}
        <div className="light-panel">
          <div className="light-panel-title" style={{ marginBottom: '1rem' }}>
            <Lock size={20} color="#e11d48" />
            <span>Security & Session</span>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>Authentication:</span>
            <strong>JWT Bearer (7-Day Expiry)</strong>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>Password Encryption:</span>
            <strong>Bcrypt Hashed (Salt 10)</strong>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>Session Status:</span>
            <span style={{ color: '#16a34a', fontWeight: 700 }}>● Active & Authenticated</span>
          </div>

          <div className="account-info-row">
            <span style={{ color: '#64748b' }}>Server Endpoint:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
              /api/auth/me
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
