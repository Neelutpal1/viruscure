import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Activity, Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    const success = login(username.toLowerCase().trim(), password);
    if (success) {
      navigate(`/${username.toLowerCase().trim()}`);
    } else {
      setError('Invalid credentials. Hint: use nurse/doctor/admin and password123');
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '50%', boxShadow: 'var(--shadow-glow)' }}>
            <Activity color="var(--primary)" size={48} />
          </div>
          <h1 className="text-center" style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(to right, var(--primary-light), var(--secondary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VirusCure
          </h1>
          <p className="text-muted text-center" style={{ fontSize: '0.875rem' }}>
            Secure Authentication Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="input-group delay-100 animate-fade-in">
            <label htmlFor="username">Username</label>
            <input 
              id="username"
              type="text"
              className="input-field"
              placeholder="nurse, doctor, or admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group delay-200 animate-fade-in">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-danger delay-300 animate-fade-in" style={{ fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary delay-300 animate-fade-in mt-4" style={{ width: '100%' }}>
            <Lock size={18} /> Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
