import React from 'react';
import { Wind, ShieldCheck, HardHat, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar({ user, currentView, onNavigate, onLogout }) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isOwner = user?.role === 'owner';

  return (
    <header className="navbar-light">
      <div className="nav-brand-group">
        <div className="nav-brand" onClick={() => onNavigate('dashboard')}>
          <div className="brand-icon">
            <Wind size={22} color="#ffffff" />
          </div>
          <div>
            <div className="brand-title">AC Warehouse</div>
            <div className="brand-subtitle">Warehouse Inventory Software</div>
          </div>
        </div>

        {/* View Navigation Links */}
        <div className="nav-links">
          <button
            className={`nav-link-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-link-btn ${currentView === 'account' ? 'active' : ''}`}
            onClick={() => onNavigate('account')}
          >
            <User size={16} />
            <span>Account Info</span>
          </button>
        </div>
      </div>

      <div className="nav-right-actions">
        {/* Role Badge (Owner or Worker) */}
        <div className={`role-badge-light ${user?.role}`}>
          {isOwner ? (
            <>
              <ShieldCheck size={14} />
              <span>OWNER</span>
            </>
          ) : (
            <>
              <HardHat size={14} />
              <span>WORKER</span>
            </>
          )}
        </div>

        {/* User Avatar Button (Links to Account Info) */}
        <button
          className="user-avatar-btn"
          onClick={() => onNavigate('account')}
          title="View Account Details"
        >
          <div className="avatar-circle">
            {getInitials(user?.name)}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
            {user?.name}
          </span>
        </button>

        {/* Sign Out Button */}
        <button className="btn-signout" onClick={onLogout} title="Sign Out">
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
