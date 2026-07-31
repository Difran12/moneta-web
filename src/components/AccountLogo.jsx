import React from 'react';
import { Banknote, Building2, Building, Smartphone, Wallet, CreditCard, ShoppingBag, Landmark } from 'lucide-react';

// High-Definition Official Vector Brand Logos (Full Proportions)
const RealBrandLogos = {
  bca: () => (
    <svg viewBox="0 0 130 45" width="58" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="130" height="45" rx="8" fill="#00569E"/>
      <path d="M15 12H27C31.5 12 34 14 34 17.5C34 19.8 32.5 21.2 30 22C33 22.8 35 24.8 35 28C35 32 31.5 33.5 26.5 33.5H15V12ZM22 19H25.5C27.2 19 28.2 18.2 28.2 16.8C28.2 15.4 27.2 14.8 25.5 14.8H22V19ZM22 30.5H26C27.8 30.5 29 29.5 29 27.8C29 26 27.8 25 26 25H22V30.5Z" fill="white"/>
      <path d="M52 12C59 12 64.5 16 64.5 23H56.5C56.5 19.2 54.5 16.5 51.5 16.5C48.5 16.5 46.5 19 46.5 23C46.5 27 48.5 29.5 51.5 29.5C54.5 29.5 56.5 26.8 56.5 23H64.5C64.5 30 59 34 52 34C42 34 38 27.5 38 23C38 18.5 42 12 52 12Z" fill="white"/>
      <path d="M83 12H93.5L104 33.5H94.5L92.5 29H83.5L81.5 33.5H72.5L83 12ZM88 19L85 25.5H91L88 19Z" fill="white"/>
    </svg>
  ),
  mandiri: () => (
    <svg viewBox="0 0 160 45" width="70" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="45" rx="8" fill="#002D62"/>
      <path d="M12 14H18L24 28L30 14H36V32H31V19.5L25.5 32H22.5L17 19.5V32H12V14Z" fill="#FFFFFF"/>
      <path d="M42 20H47V32H42V20ZM42 14H47V17.5H42V14Z" fill="#FFFFFF"/>
      <path d="M52 20H57V22.2C58.5 20.5 61 19.8 63.2 20C67.2 20 69 22.5 69 26.5V32H64V25C64 22.2 63 21.5 61.2 21.5C59 21.5 57 23 57 25.8V32H52V20Z" fill="#FFFFFF"/>
      <path d="M78 12C95 12 110 17 118 22.5L112 28.5C106 24 94 20 83 20C68 20 59 27.5 59 34.5H51C51 23.5 63 12 78 12Z" fill="#F59E0B"/>
    </svg>
  ),
  gopay: () => (
    <svg viewBox="0 0 145 45" width="64" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="145" height="45" rx="8" fill="#00AED6"/>
      <circle cx="23" cy="22.5" r="10.5" fill="white"/>
      <circle cx="23" cy="22.5" r="5" fill="#00AED6"/>
      <text x="42" y="30" fontFamily="Outfit, sans-serif" fontSize="21" fontWeight="800" fill="white">gopay</text>
    </svg>
  ),
  ovo: () => (
    <svg viewBox="0 0 120 45" width="54" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="45" rx="8" fill="#4C2A86"/>
      <text x="16" y="31" fontFamily="Outfit, sans-serif" fontSize="24" fontWeight="900" fill="#70D44B" letterSpacing="2">OVO</text>
    </svg>
  ),
  dana: () => (
    <svg viewBox="0 0 135 45" width="60" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="135" height="45" rx="8" fill="#118EEA"/>
      <text x="18" y="30" fontFamily="Outfit, sans-serif" fontSize="22" fontWeight="900" fill="white" letterSpacing="2.5">DANA</text>
    </svg>
  ),
  shopeepay: () => (
    <svg viewBox="0 0 165 45" width="74" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="165" height="45" rx="8" fill="#EE4D2D"/>
      <text x="12" y="29" fontFamily="Outfit, sans-serif" fontSize="19" fontWeight="800" fill="white">ShopeePay</text>
    </svg>
  ),
  bri: () => (
    <svg viewBox="0 0 120 45" width="54" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="45" rx="8" fill="#00529C"/>
      <text x="20" y="31" fontFamily="Outfit, sans-serif" fontSize="24" fontWeight="900" fill="white" letterSpacing="2.5">BRI</text>
    </svg>
  ),
  bni: () => (
    <svg viewBox="0 0 120 45" width="54" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="45" rx="8" fill="#F15A24"/>
      <text x="20" y="31" fontFamily="Outfit, sans-serif" fontSize="24" fontWeight="900" fill="white" letterSpacing="2.5">BNI</text>
    </svg>
  ),
  tunai: () => (
    <svg viewBox="0 0 135 45" width="60" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="135" height="45" rx="8" fill="#10B981"/>
      <text x="16" y="29" fontFamily="Outfit, sans-serif" fontSize="19" fontWeight="800" fill="white">💵 TUNAI</text>
    </svg>
  )
};

export function getAccountMeta(accountName = '') {
  const name = accountName.toLowerCase();
  
  if (name.includes('tunai') || name.includes('cash')) {
    return { label: 'Tunai', color: '#10b981', bg: 'rgba(16, 185, 129, 0.16)', key: 'tunai', icon: Banknote };
  }
  if (name.includes('bca')) {
    return { label: 'BCA', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', key: 'bca', icon: Building2 };
  }
  if (name.includes('mandiri')) {
    return { label: 'Mandiri', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', key: 'mandiri', icon: Building };
  }
  if (name.includes('gopay')) {
    return { label: 'Gopay', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', key: 'gopay', icon: Smartphone };
  }
  if (name.includes('ovo')) {
    return { label: 'OVO', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', key: 'ovo', icon: Wallet };
  }
  if (name.includes('dana')) {
    return { label: 'DANA', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.2)', key: 'dana', icon: CreditCard };
  }
  if (name.includes('shopee') || name.includes('spay')) {
    return { label: 'ShopeePay', color: '#f97316', bg: 'rgba(249, 115, 22, 0.2)', key: 'shopeepay', icon: ShoppingBag };
  }
  if (name.includes('bri')) {
    return { label: 'BRI', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.2)', key: 'bri', icon: Landmark };
  }
  if (name.includes('bni')) {
    return { label: 'BNI', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.2)', key: 'bni', icon: Building2 };
  }

  // Default fallback
  return { label: accountName, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.18)', key: null, icon: Wallet };
}

export default function AccountLogo({ name, showLabel = true, style = {} }) {
  const meta = getAccountMeta(name);
  const BrandSvgLogo = meta.key ? RealBrandLogos[meta.key] : null;
  const FallbackIcon = meta.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.3rem 0.75rem 0.3rem 0.35rem',
        borderRadius: '8px',
        background: meta.bg,
        color: meta.color,
        fontSize: '0.85rem',
        fontWeight: 700,
        fontFamily: 'Outfit, sans-serif',
        border: `1px solid ${meta.color}50`,
        whiteSpace: 'nowrap',
        lineHeight: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        ...style
      }}
      title={name || meta.label}
    >
      {BrandSvgLogo ? (
        <span style={{ display: 'inline-flex', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
          <BrandSvgLogo />
        </span>
      ) : (
        <span style={{ background: meta.color, color: 'white', padding: '4px 6px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <FallbackIcon size={14} />
        </span>
      )}
      {showLabel && <span style={{ marginLeft: '2px' }}>{name || meta.label}</span>}
    </span>
  );
}
