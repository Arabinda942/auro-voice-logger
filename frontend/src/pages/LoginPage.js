import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { Shield, Headphones, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('admin');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginId || !password) { setError('Please enter login ID and password.'); return; }
    const res = await login(loginId, password);
    if (res.ok) {
      const isSuperOrBranch = ['Super Admin', 'Branch Admin'].includes(res.role);
      navigate(isSuperOrBranch ? '/admin' : '/agent');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark">
            <span className="login-mark-text">AL</span>
          </div>
          <div className="login-name">AURO Limited</div>
          <div className="login-sub">Voice Logger</div>
        </div>

        <div className="login-divider"><span>Sign in to continue</span></div>

        <div className="role-switch">
          <button
            className={`role-btn${role === 'admin' ? ' active' : ''}`}
            type="button"
            onClick={() => setRole('admin')}
          >
            <Shield size={13} style={{ marginRight: 5, verticalAlign: -2 }} />
            Admin
          </button>
          <button
            className={`role-btn${role === 'agent' ? ' active' : ''}`}
            type="button"
            onClick={() => setRole('agent')}
          >
            <Headphones size={13} style={{ marginRight: 5, verticalAlign: -2 }} />
            Agent
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Login ID</label>
            <input
              className="login-input"
              type="text"
              placeholder={role === 'admin' ? 'admin' : 'your.loginid'}
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            <LogIn size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          AURO Limited · Voice Logger v2.0
        </div>
      </div>
    </div>
  );
}
