import React, { useState } from 'react';
import { useStore } from '../store/useStore.jsx';
import { Wallet, Lock, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginModal() {
  const { isLoggedIn, setIsLoggedIn, userProfile } = useStore();
  const [email, setEmail] = useState('alex.thompson@moneta.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  if (isLoggedIn) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Mohon isi email dan kata sandi');
      return;
    }
    setIsLoggedIn(true);
    setError('');
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(11, 14, 20, 0.95)', backdropFilter: 'blur(20px)', zIndex: 1000 }}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '420px', padding: '2rem 1.75rem', textAlign: 'center' }}>
        
        {/* Logo Emblem */}
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '1.6rem', margin: '0 auto 1.25rem', boxShadow: '0 0 25px rgba(37, 99, 235, 0.6)' }}>
          M
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Masuk ke Moneta</h2>
        <p className="text-secondary" style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>
          Personal Finance & Budgeting Platform
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div className="input-group">
            <label>Alamat Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alex.thompson@moneta.app"
              required
            />
          </div>

          <div className="input-group">
            <label>Kata Sandi</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Masuk Sekarang <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Demo Account: <strong>alex.thompson@moneta.app</strong>
        </div>
      </div>
    </div>
  );
}
