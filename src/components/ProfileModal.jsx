import React, { useState } from 'react';
import { useStore } from '../store/useStore.jsx';
import { User, Shield, Lock, LogOut, Key, CheckCircle, AlertCircle, X, Mail, Phone } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { userProfile, updateUserProfile, isLoggedIn, setIsLoggedIn, t } = useStore();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'session'

  // Profile State
  const [name, setName] = useState(userProfile?.name || 'Alex Thompson');
  const [email, setEmail] = useState(userProfile?.email || 'alex.thompson@moneta.app');
  const [phone, setPhone] = useState('+62 812-3456-7890');
  const [profileMessage, setProfileMessage] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!isOpen) return null;

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({ name, email });
    setProfileMessage('Profil berhasil diperbarui!');
    setTimeout(() => setProfileMessage(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    updateUserProfile({ ...userProfile, password: newPassword });
    setPasswordSuccess('Kata sandi berhasil diubah!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '540px', padding: '1.5rem' }}>
        
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {userProfile.initials || 'AT'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('profileSettings')}</h2>
              <p className="text-secondary" style={{ fontSize: '0.78rem' }}>{t('appSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn" style={{ padding: '0.35rem', background: 'none', boxShadow: 'none', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: '10px', gap: '0.25rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'profile' ? 'var(--bg-panel)' : 'transparent',
              color: activeTab === 'profile' ? '#3B82F6' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <User size={14} /> {t('myProfile')}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'security' ? 'var(--bg-panel)' : 'transparent',
              color: activeTab === 'security' ? '#3B82F6' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Lock size={14} /> {t('password')}
          </button>

          <button
            onClick={() => setActiveTab('session')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'session' ? 'var(--bg-panel)' : 'transparent',
              color: activeTab === 'session' ? '#3B82F6' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Shield size={14} /> {t('loginSessions')}
          </button>
        </div>

        {/* TAB 1: INFORMASI PROFIL */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
            {profileMessage && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.55rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} /> {profileMessage}
              </div>
            )}

            <div className="input-group">
              <label>Nama Lengkap</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Alamat Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                className="input-field"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.6rem' }}>
              Simpan Perubahan Profil
            </button>
          </form>
        )}

        {/* TAB 2: KATA SANDI */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
            {passwordError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.55rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.55rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} /> {passwordSuccess}
              </div>
            )}

            <div className="input-group">
              <label>Kata Sandi Saat Ini</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Kata Sandi Baru</label>
              <input
                type="password"
                className="input-field"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                className="input-field"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.6rem' }}>
              <Key size={16} /> Perbarui Kata Sandi
            </button>
          </form>
        )}

        {/* TAB 3: SESI LOGIN & LOGOUT */}
        {activeTab === 'session' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Status Sesi Login</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                  ● Aktif (Windows OS)
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Terhubung sebagai: <strong>{userProfile.email}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Terakhir diperbarui: Hari ini 13:20 PM
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#EF4444' }}>Keluar dari Akun</h4>
              <p className="text-secondary" style={{ fontSize: '0.78rem', marginBottom: '1rem' }}>
                Keluar dari sesi perangkat ini. Anda akan diminta memasukkan email dan kata sandi saat masuk kembali.
              </p>
              <button
                onClick={handleLogout}
                className="btn"
                style={{ width: '100%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <LogOut size={16} /> Keluar / Logout Sesi
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
