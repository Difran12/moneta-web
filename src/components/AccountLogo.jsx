import React from 'react';
import { Banknote, Building2, Building, Smartphone, Wallet, CreditCard, ShoppingBag, Landmark } from 'lucide-react';

export function getAccountMeta(accountName = '') {
  const name = accountName.toLowerCase();
  
  if (name.includes('tunai') || name.includes('cash')) {
    return { label: 'Tunai', color: '#10b981', bg: 'rgba(16, 185, 129, 0.18)', icon: Banknote };
  }
  if (name.includes('bca')) {
    return { label: 'BCA', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', icon: Building2 };
  }
  if (name.includes('mandiri')) {
    return { label: 'Mandiri', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', icon: Building };
  }
  if (name.includes('gopay')) {
    return { label: 'Gopay', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.2)', icon: Smartphone };
  }
  if (name.includes('ovo')) {
    return { label: 'OVO', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', icon: Wallet };
  }
  if (name.includes('dana')) {
    return { label: 'DANA', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.2)', icon: CreditCard };
  }
  if (name.includes('shopee') || name.includes('spay')) {
    return { label: 'ShopeePay', color: '#f97316', bg: 'rgba(249, 115, 22, 0.2)', icon: ShoppingBag };
  }
  if (name.includes('bri')) {
    return { label: 'BRI', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.2)', icon: Landmark };
  }
  if (name.includes('bni')) {
    return { label: 'BNI', color: '#ea580c', bg: 'rgba(234, 88, 12, 0.2)', icon: Building2 };
  }

  // Default fallback
  return { label: accountName, color: '#818cf8', bg: 'rgba(129, 140, 248, 0.18)', icon: Wallet };
}

export default function AccountLogo({ name, size = 14, showLabel = true, style = {} }) {
  const meta = getAccountMeta(name);
  const IconComponent = meta.icon;

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
      <IconComponent size={size} style={{ color: meta.color }} />
      {showLabel && <span>{name || meta.label}</span>}
    </span>
  );
}
