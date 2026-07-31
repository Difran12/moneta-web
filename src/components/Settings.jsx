import React, { useState } from 'react';
import { useStore } from '../store/useStore.jsx';
import AccountLogo from './AccountLogo';
import { BANK_AND_WALLET_CATALOG } from '../utils/bankAndWalletCatalog';
import { Trash2, Plus, Minus, AlertCircle, Save } from 'lucide-react';

export default function Settings() {
  const { accounts, setAccounts, incomeCategories, setIncomeCategories, allocations, setAllocations, t } = useStore();

  const [newAccount, setNewAccount] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');

  // Local state for allocations so we only save when valid
  const [localAllocations, setLocalAllocations] = useState(allocations);
  
  const totalPercent = localAllocations.reduce((sum, item) => sum + item.percent, 0);
  const isAllocationValid = totalPercent === 100;

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newAccount.trim()) return;
    if (accounts.includes(newAccount.trim())) return;
    setAccounts([...accounts, newAccount.trim()]);
    setNewAccount('');
  };

  const handleDeleteAccount = (acc) => {
    if (accounts.length <= 1) return; // Must have at least 1
    setAccounts(accounts.filter(a => a !== acc));
  };

  const handleAddIncomeCat = (e) => {
    e.preventDefault();
    if (!newIncomeCat.trim()) return;
    if (incomeCategories.includes(newIncomeCat.trim())) return;
    setIncomeCategories([...incomeCategories, newIncomeCat.trim()]);
    setNewIncomeCat('');
  };

  const handleDeleteIncomeCat = (cat) => {
    if (incomeCategories.length <= 1) return;
    setIncomeCategories(incomeCategories.filter(c => c !== cat));
  };

  const handleAllocationChange = (id, newPercent) => {
    setLocalAllocations(prev => {
      const current = prev.find(a => a.id === id);
      if (!current) return prev;
      const otherTotal = prev.reduce((sum, item) => item.id === id ? sum : sum + item.percent, 0);
      const clampedPercent = Math.max(0, Math.min(100 - otherTotal, Number(newPercent)));
      return prev.map(alloc => alloc.id === id ? { ...alloc, percent: clampedPercent } : alloc);
    });
  };

  const handleSaveAllocations = () => {
    if (isAllocationValid) {
      setAllocations(localAllocations);
      alert(t('savedSuccess'));
    }
  };

  const handleAddAllocationCat = () => {
    const newId = Date.now().toString();
    setLocalAllocations([...localAllocations, { id: newId, name: 'Kategori Baru', percent: 0, color: '#94a3b8' }]);
  };

  const handleDeleteAllocationCat = (id) => {
    setLocalAllocations(localAllocations.filter(a => a.id !== id));
  };

  const handleAllocationNameChange = (id, newName) => {
    setLocalAllocations(prev => 
      prev.map(alloc => alloc.id === id ? { ...alloc, name: newName } : alloc)
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      <div className="grid-cols-2" style={{ gap: '2rem' }}>
        {/* Account Types (Bank & E-Wallet Categories) */}
        <div className="glass-card animate-fade-in">
          <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('accountTypesTitle')}</h3>
            <span style={{ fontSize: '0.75rem', background: 'var(--bg-tab)', padding: '0.2rem 0.5rem', borderRadius: '6px', color: 'var(--text-secondary)' }}>
              Bank & E-Wallet Catalog
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
            {accounts.map(acc => (
              <div key={acc} className="flex-between" style={{ padding: '0.6rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', transition: 'all 0.2s' }}>
                <AccountLogo name={acc} size={16} />
                <button onClick={() => handleDeleteAccount(acc)} className="btn" style={{ background: 'none', color: 'var(--accent-expense)', padding: '0.2rem', boxShadow: 'none' }} title={t('delete')}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Catalog Quick Add Preset Selector */}
          <div style={{ marginBottom: '1rem', padding: '0.85rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem', display: 'block' }}>
              {t('quickAddCatalogLabel')}
            </label>
            <select
              className="input-field"
              style={{ fontSize: '0.85rem', background: 'var(--bg-panel)', fontWeight: 600 }}
              onChange={(e) => {
                const val = e.target.value;
                if (val && !accounts.includes(val)) {
                  setAccounts([...accounts, val]);
                  e.target.value = '';
                }
              }}
            >
              <option value="">{t('selectOfficialCatalog')}</option>
              <optgroup label={t('bankIndonesiaGroup')}>
                {BANK_AND_WALLET_CATALOG.bank.map(b => (
                  <option key={b.code} value={b.name} disabled={accounts.includes(b.name)}>{b.name} {accounts.includes(b.name) ? t('alreadyAdded') : ''}</option>
                ))}
              </optgroup>
              <optgroup label={t('eWalletGroup')}>
                {BANK_AND_WALLET_CATALOG.ewallet.map(w => (
                  <option key={w.code} value={w.name} disabled={accounts.includes(w.name)}>{w.name} {accounts.includes(w.name) ? t('alreadyAdded') : ''}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <form onSubmit={handleAddAccount} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={newAccount} 
              onChange={e => setNewAccount(e.target.value)} 
              className="input-field" 
              placeholder={t('addAccountPlaceholder')} 
              style={{ flex: 1 }} 
            />
            <button type="submit" className="btn btn-primary"><Plus size={18} /></button>
          </form>
        </div>

        {/* Income Categories */}
        <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', fontSize: '1.1rem' }}>{t('incomeCatTitle')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {incomeCategories.map(cat => (
              <div key={cat} className="flex-between" style={{ padding: '0.6rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', transition: 'all 0.2s' }}>
                <span style={{ fontWeight: 500 }}>{cat}</span>
                <button onClick={() => handleDeleteIncomeCat(cat)} className="btn" style={{ background: 'none', color: 'var(--accent-expense)', padding: '0.2rem', boxShadow: 'none' }} title={t('delete')}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddIncomeCat} style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={newIncomeCat} 
              onChange={e => setNewIncomeCat(e.target.value)} 
              className="input-field" 
              placeholder={t('addIncomeCatPlaceholder')} 
              style={{ flex: 1 }} 
            />
            <button type="submit" className="btn btn-primary"><Plus size={18} /></button>
          </form>
        </div>
      </div>

      {/* Allocation Percentages */}
      <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>{t('expenseCatTitle')}</h3>
          <button 
            onClick={handleAddAllocationCat} 
            disabled={totalPercent >= 100}
            className="btn" 
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-tab)', opacity: totalPercent >= 100 ? 0.5 : 1, cursor: totalPercent >= 100 ? 'not-allowed' : 'pointer' }}
          >
            <Plus size={16} /> {t('addCategory')}
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.5rem' }}>
          {localAllocations.map(alloc => (
            <div key={alloc.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'center', padding: '0.35rem 0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <input 
                type="text" 
                value={alloc.name} 
                onChange={(e) => handleAllocationNameChange(alloc.id, e.target.value)} 
                className="input-field" 
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.9rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }} 
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleAllocationChange(alloc.id, alloc.percent - 1)}
                  disabled={alloc.percent <= 0}
                  className="btn" 
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    background: 'var(--bg-panel)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)', 
                    minWidth: 'auto',
                    opacity: alloc.percent <= 0 ? 0.3 : 1,
                    cursor: alloc.percent <= 0 ? 'not-allowed' : 'pointer'
                  }}
                  title={alloc.percent <= 0 ? 'Sudah 0%' : 'Kurangi 1%'}
                >
                  <Minus size={14} />
                </button>
                <span style={{ width: '45px', textAlign: 'center', fontWeight: 600, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>{alloc.percent}%</span>
                <button 
                  onClick={() => handleAllocationChange(alloc.id, alloc.percent + 1)}
                  disabled={totalPercent >= 100}
                  className="btn" 
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    background: 'var(--bg-panel)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text-primary)', 
                    minWidth: 'auto',
                    opacity: totalPercent >= 100 ? 0.3 : 1,
                    cursor: totalPercent >= 100 ? 'not-allowed' : 'pointer'
                  }}
                  title={totalPercent >= 100 ? 'Batas maksimum 100% tercapai' : 'Tambah 1%'}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => handleDeleteAllocationCat(alloc.id)} className="btn" style={{ background: 'none', color: 'var(--accent-expense)', padding: '0.35rem', boxShadow: 'none' }} title={t('delete')}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex-between" style={{ padding: '0.85rem 1.25rem', background: isAllocationValid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${isAllocationValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isAllocationValid ? '#10b981' : '#ef4444' }}>
            {!isAllocationValid && <AlertCircle size={20} />}
            <span style={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif', fontSize: '1rem' }}>{t('totalAllocation')}: {totalPercent}%</span>
          </div>
          
          <button 
            onClick={handleSaveAllocations} 
            disabled={!isAllocationValid} 
            className="btn btn-primary" 
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: isAllocationValid ? 1 : 0.5, cursor: isAllocationValid ? 'pointer' : 'not-allowed' }}
          >
            <Save size={18} /> {t('saveAllocations')}
          </button>
        </div>

      </div>

    </div>
  );
}
