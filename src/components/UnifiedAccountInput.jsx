import React, { useState, useRef, useEffect } from 'react';
import AccountLogo from './AccountLogo';
import { ALL_ACCOUNTS_LIST } from '../utils/bankAndWalletCatalog';
import { useStore } from '../store/useStore.jsx';
import { Plus, Check, Sparkles } from 'lucide-react';

export default function UnifiedAccountInput({ existingAccounts, onAddAccount }) {
  const { t } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = ALL_ACCOUNTS_LIST.filter(item => {
    const query = inputValue.toLowerCase().trim();
    if (!query) return true;
    return item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query);
  });

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    onAddAccount(inputValue.trim());
    setInputValue('');
    setIsOpen(false);
  };

  const handleSelectCatalog = (name) => {
    onAddAccount(name);
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="input-field"
            placeholder={t('addAccountPlaceholder')}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" className="btn btn-primary" title={t('addCategory')}>
          <Plus size={18} />
        </button>
      </form>

      {/* Autocomplete Catalog Suggestions Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            padding: '0.65rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.2rem 0.4rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={12} style={{ color: 'var(--accent-brand)' }} /> Katalog Bank & E-Wallet Resmi
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>1-Click Add</span>
          </div>

          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '2px' }}>
            {suggestions.length === 0 ? (
              <div style={{ padding: '0.6rem', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Tekan Enter atau klik + untuk menambah "<strong>{inputValue}</strong>"
              </div>
            ) : (
              suggestions.map(item => {
                const isAdded = existingAccounts.includes(item.name);
                return (
                  <div
                    key={item.code}
                    onClick={() => {
                      if (!isAdded) handleSelectCatalog(item.name);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      cursor: isAdded ? 'default' : 'pointer',
                      opacity: isAdded ? 0.6 : 1,
                      background: 'transparent',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isAdded) e.currentTarget.style.background = 'var(--bg-input)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isAdded) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <AccountLogo name={item.name} size={14} />
                    {isAdded ? (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Check size={12} /> {t('alreadyAdded')}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-brand)', fontWeight: 600 }}>
                        + Add
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
