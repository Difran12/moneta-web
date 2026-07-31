import React from 'react';
import { Banknote, Building2, Building, Smartphone, Wallet, CreditCard, ShoppingBag, Landmark } from 'lucide-react';

// Brand icon boxes for top Indonesian banks and e-wallets
const BrandIconMap = {
  bca: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#00569E"/>
      <path d="M7 10H14C16.5 10 18 11.2 18 13.2C18 14.5 17 15.5 15.5 15.8C17.2 16.2 18.5 17.5 18.5 19.8C18.5 22.2 16.5 23.2 13.8 23.2H7V10ZM11.5 14.8H13.2C14.2 14.8 15 14.3 15 13.4C15 12.5 14.2 12.2 13.2 12.2H11.5V14.8ZM11.5 21H13.5C14.8 21 15.8 20.3 15.8 19.2C15.8 18.1 14.8 17.6 13.5 17.6H11.5V21Z" fill="white"/>
      <path d="M22 10C24.5 10 26.5 11.8 26.5 14.8H23.5C23.5 13.2 22.8 12 21.8 12C20.8 12 20 13.2 20 16.5C20 19.8 20.8 21 21.8 21C22.8 21 23.5 19.8 23.5 18.2H26.5C26.5 21.2 24.5 23 22 23C18.5 23 17 19.8 17 16.5C17 13.2 18.5 10 22 10Z" fill="white"/>
    </svg>
  ),
  mandiri: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#002D62"/>
      <path d="M6 10H10L14 20L18 10H22V22H18.5V14.5L15 22H13L9.5 14.5V22H6V10Z" fill="#F59E0B"/>
    </svg>
  ),
  gopay: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#00AED6"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
      <circle cx="16" cy="16" r="4" fill="#00AED6"/>
    </svg>
  ),
  ovo: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#4C2A86"/>
      <circle cx="16" cy="16" r="7" stroke="#70D44B" strokeWidth="3.5" fill="none"/>
    </svg>
  ),
  dana: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#118EEA"/>
      <path d="M9 10H16C20 10 23 12.5 23 16C23 19.5 20 22 16 22H9V10ZM13.5 18.5H16C18 18.5 19.5 17.5 19.5 16C19.5 14.5 18 13.5 16 13.5H13.5V18.5Z" fill="white"/>
    </svg>
  ),
  shopeepay: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#EE4D2D"/>
      <path d="M16 8C13 8 11 9.8 11 12C11 14.5 13.5 15 16 15.5C18.5 16 21 16.5 21 19C21 21.5 18.8 23 16 23C13 23 11 21.2 11 19.2H8.5C8.5 22.8 11.5 25 15 25V27H17V25C20.5 25 23.5 22.8 23.5 19C23.5 16.2 21 15.5 18 14.8C15.5 14.2 13.5 13.8 13.5 12C13.5 10.5 15 9.5 16.5 9.5C18.5 9.5 20 10.8 20 12.5H22.5C22.5 9.5 20 7 16.5 7V5H14.5V7C14.3 7 14.1 7 14 7Z" fill="white"/>
    </svg>
  ),
  bri: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#00529C"/>
      <text x="5" y="22" fontFamily="Outfit, sans-serif" fontSize="13" fontWeight="900" fill="white" letterSpacing="1">BRI</text>
    </svg>
  ),
  bni: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#F15A24"/>
      <text x="4" y="22" fontFamily="Outfit, sans-serif" fontSize="13" fontWeight="900" fill="white" letterSpacing="1">BNI</text>
    </svg>
  ),
  tunai: (props) => (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="6" fill="#10B981"/>
      <rect x="7" y="10" width="18" height="12" rx="2" stroke="white" strokeWidth="2" fill="none"/>
      <circle cx="16" cy="16" r="3" fill="white"/>
    </svg>
  )
};

export function getAccountMeta(accountName = '') {
  const name = accountName.toLowerCase();
  
  if (name.includes('tunai') || name.includes('cash')) {
    return { label: 'Tunai', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', key: 'tunai', icon: Banknote };
  }
  if (name.includes('bca')) {
    return { label: 'BCA', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.18)', key: 'bca', icon: Building2 };
  }
  if (name.includes('mandiri')) {
    return { label: 'Mandiri', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.18)', key: 'mandiri', icon: Building };
  }
  if (name.includes('gopay')) {
    return { label: 'Gopay', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.18)', key: 'gopay', icon: Smartphone };
  }
  if (name.includes('ovo')) {
    return { label: 'OVO', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.18)', key: 'ovo', icon: Wallet };
  }
  if (name.includes('dana')) {
    return { label: 'DANA', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.18)', key: 'dana', icon: CreditCard };
  }
  if (name.includes('shopee') || name.includes('spay')) {
    return { label: 'ShopeePay', color: '#f97316', bg: 'rgba(249, 115, 22, 0.18)', key: 'shopeepay', icon: ShoppingBag };
  }
  if (name.includes('bri')) {
    return { label: 'BRI', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.18)', key: 'bri', icon: Landmark };
  }
  if (name.includes('bni')) {
    return { label: 'BNI', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.18)', key: 'bni', icon: Building2 };
  }

  // Default fallback
  return { label: accountName, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.18)', key: null, icon: Wallet };
}

export default function AccountLogo({ name, showLabel = true, style = {} }) {
  const meta = getAccountMeta(name);
  const BrandIcon = meta.key ? BrandIconMap[meta.key] : null;
  const FallbackIcon = meta.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.25rem 0.65rem 0.25rem 0.35rem',
        borderRadius: '8px',
        background: meta.bg,
        color: meta.color,
        fontSize: '0.78rem',
        fontWeight: 700,
        fontFamily: 'Outfit, sans-serif',
        border: `1px solid ${meta.color}45`,
        whiteSpace: 'nowrap',
        lineHeight: 1,
        ...style
      }}
      title={name || meta.label}
    >
      {BrandIcon ? (
        <BrandIcon style={{ borderRadius: '4px', flexShrink: 0 }} />
      ) : (
        <span style={{ background: meta.color, color: 'white', padding: '3px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <FallbackIcon size={12} />
        </span>
      )}
      {showLabel && <span>{name || meta.label}</span>}
    </span>
  );
}
