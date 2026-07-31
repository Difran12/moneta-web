import React, { useState, useRef, useEffect } from 'react';
import AccountLogo, { getAccountMeta } from './AccountLogo';
import { useStore } from '../store/useStore.jsx';
import { Search, ChevronDown, Check } from 'lucide-react';

export default function SearchableAccountSelect({ accounts, value, onChange, placeholder }) {
  const { t } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAccounts = accounts.filter(acc => {
    const meta = getAccountMeta(acc);
    const matchesSearch = acc.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'CASH') {
      return matchesSearch && meta.categoryLabel.includes('Cash');
    }
    if (categoryFilter === 'BANK') {
      return matchesSearch && meta.categoryLabel.includes('Bank');
    }
    if (categoryFilter === 'EWALLET') {
      return matchesSearch && meta.categoryLabel.includes('E-Wallet');
    }
    return matchesSearch;
  });

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      {/* Selected Account Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="input-field" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          cursor: 'pointer', 
          padding: '0.55rem 0.85rem',
          userSelect: 'none',
          background: 'var(--bg-input)',
          border: isOpen ? '1px solid var(--accent-brand)' : '1px solid var(--border-color)',
          boxShadow: isOpen ? '0 0 12px rgba(99, 102, 241, 0.3)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        {value ? (
          <AccountLogo name={value} size={14} />
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>{placeholder || t('selectAccount')}</span>
        )}
        <ChevronDown size={18} style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </div>

      {/* Dropdown Popup */}
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
            padding: '0.75rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.65rem' 
          }}
        >
          {/* Filter Dropdown + Search Box Header */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '0.45rem 0.6rem',
                fontSize: '0.78rem',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="ALL">{t('allCategories')}</option>
              <option value="CASH">{t('cashGroup')}</option>
              <option value="BANK">{t('bankIndonesiaGroup')}</option>
              <option value="EWALLET">{t('eWalletGroup')}</option>
            </select>

            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder={t('searchBankWalletPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.5rem 0.45rem 1.8rem',
                  fontSize: '0.78rem',
                  fontFamily: 'Outfit, sans-serif',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Account Items List */}
          <div style={{ maxHeight: '190px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingRight: '2px' }}>
            {filteredAccounts.length === 0 ? (
              <div style={{ padding: '0.85rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                No results for "{searchQuery}"
              </div>
            ) : (
              filteredAccounts.map(acc => (
                <div
                  key={acc}
                  onClick={() => {
                    onChange(acc);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.7rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: value === acc ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                    border: value === acc ? '1px solid var(--accent-brand)' : '1px solid transparent',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (value !== acc) e.currentTarget.style.background = 'var(--bg-input)';
                  }}
                  onMouseLeave={(e) => {
                    if (value !== acc) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <AccountLogo name={acc} size={14} />
                  {value === acc && <Check size={14} style={{ color: 'var(--accent-brand)' }} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
