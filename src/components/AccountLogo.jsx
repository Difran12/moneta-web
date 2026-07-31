import React from 'react';
import { Banknote, Building2, Building, Smartphone, Wallet, CreditCard, ShoppingBag, Landmark } from 'lucide-react';

// Official SVG vector logos for top Indonesian banks and e-wallets
const BrandLogos = {
  bca: (props) => (
    <svg viewBox="0 0 120 40" width="46" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="120" height="40" rx="8" fill="#00569E"/>
      <text x="18" y="27" fontFamily="Outfit, sans-serif" fontSize="22" fontWeight="900" fill="#FFFFFF" letterSpacing="2">BCA</text>
    </svg>
  ),
  mandiri: (props) => (
    <svg viewBox="0 0 140 40" width="54" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="140" height="40" rx="8" fill="#002D62"/>
      <text x="12" y="27" fontFamily="Outfit, sans-serif" fontSize="19" fontWeight="900" fill="#F59E0B" letterSpacing="1">mandırı</text>
    </svg>
  ),
  gopay: (props) => (
    <svg viewBox="0 0 130 40" width="50" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="130" height="40" rx="8" fill="#00AED6"/>
      <circle cx="20" cy="20" r="9" fill="white"/>
      <circle cx="20" cy="20" r="4.5" fill="#00AED6"/>
      <text x="36" y="27" fontFamily="Outfit, sans-serif" fontSize="19" fontWeight="800" fill="white">gopay</text>
    </svg>
  ),
  ovo: (props) => (
    <svg viewBox="0 0 110 40" width="44" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="110" height="40" rx="8" fill="#4C2A86"/>
      <text x="16" y="28" fontFamily="Outfit, sans-serif" fontSize="22" fontWeight="900" fill="#70D44B" letterSpacing="2">OVO</text>
    </svg>
  ),
  dana: (props) => (
    <svg viewBox="0 0 120 40" width="46" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="120" height="40" rx="8" fill="#118EEA"/>
      <text x="16" y="27" fontFamily="Outfit, sans-serif" fontSize="20" fontWeight="900" fill="white" letterSpacing="2">DANA</text>
    </svg>
  ),
  shopeepay: (props) => (
    <svg viewBox="0 0 145 40" width="56" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="145" height="40" rx="8" fill="#EE4D2D"/>
      <text x="12" y="26" fontFamily="Outfit, sans-serif" fontSize="17" fontWeight="800" fill="white">ShopeePay</text>
    </svg>
  ),
  bri: (props) => (
    <svg viewBox="0 0 110 40" width="44" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="110" height="40" rx="8" fill="#00529C"/>
      <text x="20" y="28" fontFamily="Outfit, sans-serif" fontSize="22" fontWeight="900" fill="white" letterSpacing="2">BRI</text>
    </svg>
  ),
  bni: (props) => (
    <svg viewBox="0 0 110 40" width="44" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="110" height="40" rx="8" fill="#F15A24"/>
      <text x="20" y="28" fontFamily="Outfit, sans-serif" fontSize="22" fontWeight="900" fill="white" letterSpacing="2">BNI</text>
    </svg>
  ),
  tunai: (props) => (
    <svg viewBox="0 0 120 40" width="48" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="120" height="40" rx="8" fill="#10B981"/>
      <text x="16" y="26" fontFamily="Outfit, sans-serif" fontSize="18" fontWeight="800" fill="white">💵 TUNAI</text>
    </svg>
  )
};

export function getAccountMeta(accountName = '') {
  const name = accountName.toLowerCase();
  
  if (name.includes('tunai') || name.includes('cash')) {
    return { label: 'Tunai', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', key: 'tunai', icon: Banknote };
  }
  if (name.includes('bca')) {
    return { label: 'BCA', color: '#00569E', bg: 'rgba(0, 86, 158, 0.2)', key: 'bca', icon: Building2 };
  }
  if (name.includes('mandiri')) {
    return { label: 'Mandiri', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', key: 'mandiri', icon: Building };
  }
  if (name.includes('gopay')) {
    return { label: 'Gopay', color: '#00AED6', bg: 'rgba(0, 173, 214, 0.2)', key: 'gopay', icon: Smartphone };
  }
  if (name.includes('ovo')) {
    return { label: 'OVO', color: '#4C2A86', bg: 'rgba(76, 42, 134, 0.25)', key: 'ovo', icon: Wallet };
  }
  if (name.includes('dana')) {
    return { label: 'DANA', color: '#118EEA', bg: 'rgba(17, 142, 234, 0.2)', key: 'dana', icon: CreditCard };
  }
  if (name.includes('shopee') || name.includes('spay')) {
    return { label: 'ShopeePay', color: '#EE4D2D', bg: 'rgba(238, 77, 45, 0.2)', key: 'shopeepay', icon: ShoppingBag };
  }
  if (name.includes('bri')) {
    return { label: 'BRI', color: '#00529C', bg: 'rgba(0, 82, 156, 0.2)', key: 'bri', icon: Landmark };
  }
  if (name.includes('bni')) {
    return { label: 'BNI', color: '#F15A24', bg: 'rgba(241, 90, 36, 0.2)', key: 'bni', icon: Building2 };
  }

  // Default fallback
  return { label: accountName, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.18)', key: null, icon: Wallet };
}

export default function AccountLogo({ name, showLabel = true, style = {} }) {
  const meta = getAccountMeta(name);
  const LogoSvg = meta.key ? BrandLogos[meta.key] : null;
  const IconComponent = meta.icon;

  if (LogoSvg) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          borderRadius: '6px',
          overflow: 'hidden',
          verticalAlign: 'middle',
          ...style
        }}
        title={name || meta.label}
      >
        <LogoSvg />
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '6px',
        background: meta.bg,
        color: meta.color,
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: 'Outfit, sans-serif',
        border: `1px solid ${meta.color}45`,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      <IconComponent size={14} style={{ color: meta.color }} />
      {showLabel && <span>{name || meta.label}</span>}
    </span>
  );
}
