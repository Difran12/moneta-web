import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore.jsx';
import YearlyReport from './components/YearlyReport';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import SavingsAndDebts from './components/SavingsAndDebts';
import ProfileModal from './components/ProfileModal';
import LoginModal from './components/LoginModal';
import SearchableAccountSelect from './components/SearchableAccountSelect';
import ToastAndConfirm from './components/ToastAndConfirm';
import AuthScreen from './components/AuthScreen';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Sun, Moon, Globe, X, AlertCircle, LayoutDashboard, Landmark, FileText, Settings as SettingsIcon, Bell, ChevronDown, Calendar, Layers, LogOut } from 'lucide-react';
import './index.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function App() {
  const { transactions, addTransaction, deleteTransaction, accounts, incomeCategories, allocations, userProfile, updateUserProfile, notifications, markAllNotificationsRead, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, isLoggedIn, authLoading, logout, lang, setLang, t, showToast, showConfirm } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);

  // Popover & Modal States for Header Controls
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [editProfileName, setEditProfileName] = useState(userProfile?.name || 'Alex Thompson');
  const [editProfileEmail, setEditProfileEmail] = useState(userProfile?.email || 'alex.thompson@moneta.app');
  const [formError, setFormError] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNowDateTimeString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    account: '',
    date: getNowDateTimeString(),
    note: ''
  });

  const theme = document.documentElement.getAttribute('data-theme') || 'dark';

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('moneta_theme', nextTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('moneta_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!editProfileName.trim()) {
      showToast(lang === 'en' ? 'Please enter your name!' : 'Mohon masukkan nama Anda!', 'warning');
      return;
    }
    updateUserProfile({ name: editProfileName, email: editProfileEmail });
    showToast(lang === 'en' ? 'Profile updated successfully!' : 'Profil pengguna berhasil diperbarui!', 'success');
    setShowProfileModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      val = new Intl.NumberFormat('id-ID').format(Number(val));
    }
    setFormData(prev => ({ ...prev, amount: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.account) {
      showToast(lang === 'en' ? 'Please complete all required fields!' : 'Mohon lengkapi semua bidang!', 'warning');
      return;
    }
    const rawAmount = Number(formData.amount.toString().replace(/[^0-9]/g, ''));
    if (isNaN(rawAmount) || rawAmount <= 0) {
      showToast(lang === 'en' ? 'Amount must be greater than 0' : 'Jumlah transaksi harus lebih besar dari 0', 'warning');
      return;
    }

    addTransaction({
      type: formData.type,
      amount: rawAmount,
      category: formData.category,
      account: formData.account,
      date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      note: formData.note
    });

    showToast(lang === 'en' ? 'Transaction added successfully!' : 'Transaksi berhasil ditambahkan!', 'success');

    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      account: '',
      date: getNowDateTimeString(),
      note: ''
    });
    setShowAddForm(false);
  };

  const toggleLang = () => setLang(lang === 'id' ? 'en' : 'id');

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background blurs */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'var(--accent-brand)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.1, top: '20%', left: '25%' }} />
        <div style={{ position: 'absolute', width: '250px', height: '250px', background: '#10b981', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.1, bottom: '20%', right: '25%' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', zIndex: 10 }}>
          {/* Glowing Icon Wrapper */}
          <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid transparent', borderTopColor: 'var(--accent-brand)', borderBottomColor: '#10b981', animation: 'spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite' }} />
            <div style={{ position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', border: '3px solid transparent', borderLeftColor: 'var(--accent-brand-light)', borderRightColor: '#34d399', animation: 'spin 1s linear infinite reverse' }} />
            <div style={{ background: 'linear-gradient(135deg, var(--accent-brand), #10b981)', padding: '0.8rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
              <Wallet size={32} color="#ffffff" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Loading Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              fontFamily: 'Outfit, sans-serif',
              background: 'linear-gradient(90deg, var(--text-primary), var(--text-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              Loading Moneta
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '1px' }}>
              SYNCING WITH CLOUD...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <AuthScreen />
        <ToastAndConfirm />
      </>
    );
  }

  return (
    <div className="app-container" onClick={() => {
      // Auto close popovers on backdrop click
    }}>
      <ToastAndConfirm />
      {/* Sleek Compact Icon Sidebar (Reference UI Layout) */}
      <aside className="app-sidebar-compact">
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Logo Emblem */}
          <div className="sidebar-logo-container">
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '1.25rem', boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)', flexShrink: 0 }}>
              M
            </div>
            <span className="logo-text">Moneta</span>
          </div>

          {/* Navigation Icon Buttons */}
          <nav className="sidebar-icon-nav">
            <button className={`sidebar-icon-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} title={t('dashboard')}>
              <LayoutDashboard size={20} style={{ flexShrink: 0 }} />
              <span className="label">{t('dashboard')}</span>
            </button>
            <button className={`sidebar-icon-item ${activeTab === 'alokasi' ? 'active' : ''}`} onClick={() => setActiveTab('alokasi')} title={t('savingsAndDebts')}>
              <Landmark size={20} style={{ flexShrink: 0 }} />
              <span className="label">{t('savingsAndDebts')}</span>
            </button>
            <button className={`sidebar-icon-item ${activeTab === 'rekap' ? 'active' : ''}`} onClick={() => setActiveTab('rekap')} title={t('yearlyReport')}>
              <FileText size={20} style={{ flexShrink: 0 }} />
              <span className="label">{t('yearlyReport')}</span>
            </button>
            <button className={`sidebar-icon-item ${activeTab === 'pengaturan' ? 'active' : ''}`} onClick={() => setActiveTab('pengaturan')} title={t('settings')}>
              <SettingsIcon size={20} style={{ flexShrink: 0 }} />
              <span className="label">{t('settings')}</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="sidebar-icon-nav" style={{ marginBottom: '1.25rem' }}>
          <button className="sidebar-icon-item" onClick={toggleLang} title="Ganti Bahasa">
            <div style={{ width: '20px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{lang.toUpperCase()}</span>
            </div>
            <span className="label">Ganti Bahasa</span>
          </button>
          <button className="sidebar-icon-item" onClick={toggleTheme} title="Ganti Tema">
            {theme === 'dark' ? <Sun size={20} style={{ flexShrink: 0 }} /> : <Moon size={20} style={{ flexShrink: 0 }} />}
            <span className="label">Ganti Tema</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main-content">
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Moneta
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
            {activeTab === 'dashboard' && (
              <button className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowAddForm(!showAddForm)}>
                <Plus size={16} /> {showAddForm ? t('cancel') : t('addTransaction')}
              </button>
            )}

            {/* Interactive Date Dropdown Pill */}
            <div
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowNotifications(false);
                setShowProfileModal(false);
              }}
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}
            >
              <Calendar size={14} />
              <span>{MONTHS[selectedMonth]} {selectedYear}</span>
              <ChevronDown size={14} />
            </div>

            {/* Date Selector Popover */}
            {showDatePicker && (
              <div style={{ position: 'absolute', top: '100%', right: '150px', marginTop: '0.5rem', width: '240px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.85rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 200 }} className="animate-fade-in">
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Pilih Periode Waktu</span>
                  <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.2rem 0.4rem', borderRadius: '6px', fontSize: '0.75rem', outline: 'none' }}>
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  {MONTHS.map((m, idx) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(idx);
                        setShowDatePicker(false);
                      }}
                      style={{
                        background: selectedMonth === idx ? '#3B82F6' : 'var(--bg-input)',
                        color: selectedMonth === idx ? '#FFF' : 'var(--text-primary)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Notification Bell */}
            <div
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowDatePicker(false);
                setShowProfileModal(false);
              }}
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', position: 'relative', cursor: 'pointer', userSelect: 'none' }}
              title="Notifikasi"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', background: '#EF4444', borderRadius: '50%' }} />
              )}
            </div>

            {/* Notifications Popover Drawer */}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '100%', right: '80px', marginTop: '0.5rem', width: '300px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 200 }} className="animate-fade-in">
                <div className="flex-between" style={{ marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Notifikasi ({unreadCount})</span>
                  <button
                    onClick={() => markAllNotificationsRead()}
                    style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Tandai Dibaca
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ background: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.55rem 0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{n.message}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--accent-brand-light)', marginTop: '0.3rem' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive User Profile Pill */}
            <div
              onClick={() => {
                setShowProfileModal(!showProfileModal);
                setShowDatePicker(false);
                setShowNotifications(false);
              }}
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '0.25rem 0.75rem 0.25rem 0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {userProfile.initials || 'AT'}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{userProfile.name}</span>
              <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
            </div>

            {/* User Profile Edit Modal / Popover */}
            {showProfileModal && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '280px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 200 }} className="animate-fade-in">
                <div style={{ textAlign: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#3B82F6', color: '#FFF', fontWeight: 800, fontSize: '1.1rem', margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}>
                    {userProfile.initials || 'AT'}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{userProfile.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{userProfile.email}</div>
                </div>

                <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>UBAH PROFIL</div>
                  <input
                    type="text"
                    className="input-field"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    value={editProfileName}
                    onChange={e => setEditProfileName(e.target.value)}
                    placeholder="Nama Pengguna"
                    required
                  />
                  <input
                    type="email"
                    className="input-field"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    value={editProfileEmail}
                    onChange={e => setEditProfileEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Simpan Perubahan
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        {showAddForm && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddForm(false)}>
            <div className="modal-content">
              <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem' }}>{t('addNewTransaction')}</h2>
                <button onClick={() => setShowAddForm(false)} className="btn" style={{ padding: '0.4rem', background: 'none', boxShadow: 'none', color: 'var(--text-secondary)' }} title={t('cancel')}>
                  <X size={20} />
                </button>
              </div>
              {formError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> {formError}
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }} className="grid-cols-2">
                <div className="input-group">
                  <label>{t('type')}</label>
                  <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="expense">{t('expense')}</option>
                    <option value="income">{t('income')}</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>{t('amount')}</label>
                  <input type="text" className="input-field" placeholder="100,000" value={formData.amount} onChange={handleAmountChange} required />
                </div>
                <div className="input-group">
                  <label>{t('category')}</label>
                  <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                    <option value="" disabled>{t('selectCategory')}</option>
                    {formData.type === 'expense' ? (
                      <>
                        {allocations.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                      </>
                    ) : (
                      <>
                        {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </>
                    )}
                  </select>
                </div>
                <div className="input-group">
                  <label>{t('account')}</label>
                  <SearchableAccountSelect 
                    accounts={accounts} 
                    value={formData.account} 
                    onChange={val => setFormData({...formData, account: val})} 
                  />
                </div>
                <div className="input-group">
                  <label>{t('dateLabel')}</label>
                  <input type="datetime-local" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>{t('note')}</label>
                  <input type="text" className="input-field" placeholder={t('notePlaceholder')} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn" style={{ flex: 1, border: '1px solid var(--border-color)' }} onClick={() => setShowAddForm(false)}>
                    {t('cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    {t('saveTransaction')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' ? (
          <Dashboard />
        ) : activeTab === 'alokasi' ? (
          <SavingsAndDebts />
        ) : activeTab === 'rekap' ? (
          <YearlyReport />
        ) : (
          <Settings />
        )}

        {/* Profile & Security Management Modal */}
        <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

        {/* Login / Auth Screen Simulation */}
        <LoginModal />
      </main>
    </div>
  );
}
