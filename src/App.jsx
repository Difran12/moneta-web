import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore.jsx';
import YearlyReport from './components/YearlyReport';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import SavingsAndDebts from './components/SavingsAndDebts';
import Investing from './components/Investing';
import SearchableAccountSelect from './components/SearchableAccountSelect';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Sun, Moon, Globe, X, AlertCircle, LayoutDashboard, PiggyBank, FileText, Settings as SettingsIcon } from 'lucide-react';
import './index.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

export default function App() {
  const { transactions, addTransaction, deleteTransaction, accounts, incomeCategories, allocations, lang, setLang, t } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const getNowDateTimeString = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [formData, setFormData] = useState({ type: 'expense', amount: '', category: '', account: accounts[0] || '', note: '', date: getNowDateTimeString() });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Prepare data for Recharts (group by date)
  const chartData = [...transactions].reverse().map(t => ({
    name: new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
    amount: t.type === 'income' ? t.amount : -t.amount,
  }));

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
      setFormData({...formData, amount: ''});
      return;
    }
    const formattedValue = Number(rawValue).toLocaleString('en-US');
    setFormData({...formData, amount: formattedValue});
  };

  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const rawAmount = Number((formData.amount || '').replace(/,/g, ''));
    
    if (!rawAmount || rawAmount <= 0) {
      setFormError(t('invalidAmountError'));
      return;
    }
    if (!formData.category) {
      setFormError(t('invalidCategoryError'));
      return;
    }
    if (!formData.account) {
      setFormError(t('invalidAccountError'));
      return;
    }
    if (!formData.date) {
      setFormError(t('invalidDateError'));
      return;
    }

    addTransaction({
      ...formData,
      amount: rawAmount
    });
    setFormData({ type: 'expense', amount: '', category: '', account: accounts[0] || '', note: '', date: getNowDateTimeString() });
    setFormError('');
    setShowAddForm(false);
  };

  const toggleLang = () => setLang(lang === 'id' ? 'en' : 'id');

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <aside className="app-sidebar">
        <div>
          {/* Brand Header */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h1 style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wallet className="text-brand" size={24} /> {t('appTitle')}
            </h1>
            <p className="text-secondary" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>{t('appSubtitle')}</p>
          </div>

          {/* Navigation Items */}
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} /> {t('dashboard')}
            </button>
            <button className={`nav-item ${activeTab === 'investing' ? 'active' : ''}`} onClick={() => setActiveTab('investing')}>
              <TrendingUp size={18} /> {t('investing')}
            </button>
            <button className={`nav-item ${activeTab === 'alokasi' ? 'active' : ''}`} onClick={() => setActiveTab('alokasi')}>
              <PiggyBank size={18} /> {t('savingsAndDebts')}
            </button>
            <button className={`nav-item ${activeTab === 'rekap' ? 'active' : ''}`} onClick={() => setActiveTab('rekap')}>
              <FileText size={18} /> {t('yearlyReport')}
            </button>
            <button className={`nav-item ${activeTab === 'pengaturan' ? 'active' : ''}`} onClick={() => setActiveTab('pengaturan')}>
              <SettingsIcon size={18} /> {t('settings')}
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
          {activeTab === 'dashboard' && (
            <button className="btn btn-primary animate-fade-in" style={{ width: '100%' }} onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={18} /> {showAddForm ? t('cancel') : t('addTransaction')}
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.82rem' }} onClick={toggleLang} title="Ganti Bahasa / Switch Language">
              <Globe size={16} /> {lang.toUpperCase()}
            </button>
            <button className="btn" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem' }} onClick={toggleTheme} title="Ganti Tema">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main-content">
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
        ) : activeTab === 'investing' ? (
          <Investing />
        ) : activeTab === 'alokasi' ? (
          <SavingsAndDebts />
        ) : activeTab === 'rekap' ? (
          <YearlyReport />
        ) : (
          <Settings />
        )}
      </main>
    </div>
  );
}
