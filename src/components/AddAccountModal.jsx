import React, { useState } from 'react';
import AccountLogo, { getAccountMeta } from './AccountLogo';
import { ALL_ACCOUNTS_LIST } from '../utils/bankAndWalletCatalog';
import { useStore } from '../store/useStore.jsx';
import { X, Search, Plus, Check, Sparkles } from 'lucide-react';

export default function AddAccountModal({ isOpen, onClose, existingAccounts, onAddAccount }) {
  const { t } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const filteredCatalog = ALL_ACCOUNTS_LIST.filter(item => {
    const meta = getAccountMeta(item.name);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'CASH') return matchesSearch && meta.categoryLabel.includes('Cash');
    if (categoryFilter === 'BANK') return matchesSearch && meta.categoryLabel.includes('Bank');
    if (categoryFilter === 'EWALLET') return matchesSearch && meta.categoryLabel.includes('E-Wallet');
    return matchesSearch;
  });

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddAccount(customName.trim());
    setCustomName('');
    onClose();
  };

  const handleAddCatalogItem = (name) => {
    onAddAccount(name);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '540px', padding: '1.5rem', borderRadius: '16px' }}>
        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={20} style={{ color: 'var(--accent-brand)' }} /> Add Account / Wallet
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Select from official catalog or add a custom name</p>
          </div>
          <button onClick={onClose} className="btn" style={{ padding: '0.4rem', background: 'none', boxShadow: 'none', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs + Search Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${categoryFilter === 'ALL' ? 'btn-primary' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '20px', background: categoryFilter === 'ALL' ? undefined : 'var(--bg-tab)' }}
              onClick={() => setCategoryFilter('ALL')}
            >
              {t('allCategories')}
            </button>
            <button
              type="button"
              className={`btn ${categoryFilter === 'BANK' ? 'btn-primary' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '20px', background: categoryFilter === 'BANK' ? undefined : 'var(--bg-tab)' }}
              onClick={() => setCategoryFilter('BANK')}
            >
              🏦 Banks
            </button>
            <button
              type="button"
              className={`btn ${categoryFilter === 'EWALLET' ? 'btn-primary' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '20px', background: categoryFilter === 'EWALLET' ? undefined : 'var(--bg-tab)' }}
              onClick={() => setCategoryFilter('EWALLET')}
            >
              📱 E-Wallets
            </button>
            <button
              type="button"
              className={`btn ${categoryFilter === 'CASH' ? 'btn-primary' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '20px', background: categoryFilter === 'CASH' ? undefined : 'var(--bg-tab)' }}
              onClick={() => setCategoryFilter('CASH')}
            >
              💵 Cash
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              className="input-field"
              placeholder={t('searchBankWalletPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem', width: '100%' }}
              autoFocus
            />
          </div>
        </div>

        {/* Catalog Grid List */}
        <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1.25rem', paddingRight: '4px' }}>
          {filteredCatalog.map(item => {
            const isAdded = existingAccounts.includes(item.name);
            return (
              <div
                key={item.code}
                onClick={() => {
                  if (!isAdded) handleAddCatalogItem(item.name);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: isAdded ? '1px solid var(--border-color)' : '1px solid rgba(99, 102, 241, 0.3)',
                  cursor: isAdded ? 'default' : 'pointer',
                  opacity: isAdded ? 0.55 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isAdded) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--accent-brand)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdded) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                  }
                }}
              >
                <AccountLogo name={item.name} size={14} />
                {isAdded ? (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={12} /> {t('alreadyAdded')}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-brand)', fontWeight: 700 }}>
                    + Add
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Account Form */}
        <form onSubmit={handleCustomSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Or type custom account (e.g., Bank Jatim)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            style={{ flex: 1, fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
            <Plus size={18} /> Add Custom
          </button>
        </form>

      </div>
    </div>
  );
}
