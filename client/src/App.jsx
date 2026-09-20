import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SignInPage from './components/SignInPage';
import WorkerPortal from './components/WorkerPortal';
import OwnerPortal from './components/OwnerPortal';
import AccountInfoPage from './components/AccountInfoPage';
import { getStoredUser, removeAuthToken, removeStoredUser } from './services/api';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'account'
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleLogout = () => {
    removeAuthToken();
    removeStoredUser();
    setUser(null);
    setCurrentView('dashboard');
    showToast('Signed out successfully');
  };

  // If not logged in, render the dedicated SignIn / Landing page
  if (!user) {
    return (
      <>
        {toast && (
          <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 100 }}>
            <div className={`alert-box ${toast.type}`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit', marginLeft: '10px' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <SignInPage
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setCurrentView('dashboard');
          }}
          showToast={showToast}
        />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Light Navbar with Dashboard and Account Info tabs, NO switch option */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {toast && (
          <div className={`alert-box ${toast.type}`}>
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'inherit' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* View Routing */}
        {currentView === 'account' ? (
          <AccountInfoPage
            user={user}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onLogout={handleLogout}
          />
        ) : (
          user.role === 'owner' ? (
            <OwnerPortal user={user} showToast={showToast} />
          ) : (
            <WorkerPortal user={user} showToast={showToast} />
          )
        )}
      </main>
    </div>
  );
}
