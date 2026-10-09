import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LogOut, Activity } from 'lucide-react';

const Layout = () => {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh' }}>
      <header className="glass-panel" style={{ margin: '1rem', borderRadius: '1rem', padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container flex items-center justify-between" style={{ padding: 0 }}>
          <div className="flex items-center gap-2">
            <Activity color="var(--primary)" size={28} />
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(to right, var(--primary-light), var(--secondary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VirusCure
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="badge badge-admitted" style={{ textTransform: 'capitalize' }}>
              {currentUser} Portal
            </span>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container animate-fade-in" style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
