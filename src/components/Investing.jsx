import React, { useState } from 'react';
import { useStore } from '../store/useStore.jsx';
import AccountLogo from './AccountLogo';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, Shield, Heart, Plus, Wallet, Sparkles, DollarSign } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatPercent = (percent) => {
  return new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(percent || 0);
};

export default function Investing() {
  const { transactions, accounts, setAccounts, addTransaction, lang, t } = useStore();
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetAmount, setAssetAmount] = useState('');

  // Calculate per-account net balance & investment portfolio
  const accountBalances = accounts.map(acc => {
    let income = 0;
    let expense = 0;
    transactions.forEach(tItem => {
      if (tItem.account === acc) {
        if (tItem.type === 'income') income += tItem.amount;
        if (tItem.type === 'expense') expense += tItem.amount;
      }
    });
    const net = income - expense;
    return { name: acc, income, expense, net };
  }).filter(item => item.net > 0);

  const totalPortfolioValue = accountBalances.reduce((sum, item) => sum + item.net, 0);

  const chartData = accountBalances.map(item => ({
    name: item.name,
    value: item.net
  }));

  const COLORS = ['#6366F1', '#10B981', '#EC4899', '#3B82F6', '#F59E0B', '#06B6D4', '#8B5CF6'];

  const handleAddAssetSubmit = (e) => {
    e.preventDefault();
    const rawAmount = Number(assetAmount.replace(/,/g, ''));
    if (!assetName || !rawAmount) return;

    if (!accounts.includes(assetName)) {
      setAccounts([...accounts, assetName]);
    }

    addTransaction({
      type: 'income',
      amount: rawAmount,
      category: 'Investasi',
      account: assetName,
      date: new Date().toISOString(),
      note: `Initial Investment ${assetName}`
    });

    setAssetName('');
    setAssetAmount('');
    setShowAddAssetModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card flex-between" style={{ padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp className="text-brand" size={24} /> Investing & Asset Portfolio
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
            Kelola portofolio saham, reksadana, crypto, dan aset tabungan Anda
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddAssetModal(true)}>
          <Plus size={18} /> + Tambah Asset / Tabungan
        </button>
      </div>

      {/* Hero Portfolio Card */}
      <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
        <div className="glass-card hero-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'between', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
              Total Portofolio Asset & Tabungan
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginTop: '0.25rem' }}>
              {formatCurrency(totalPortfolioValue)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255, 255, 255, 0.12)', padding: '0.75rem 1rem', borderRadius: '12px' }}>
            <Sparkles size={20} />
            <div style={{ fontSize: '0.82rem' }}>
              <div>Tersebar di <strong>{accountBalances.length} instrumen asset</strong></div>
              <div style={{ opacity: 0.85, fontSize: '0.75rem' }}>Update otomatis dari transaksi & saldo</div>
            </div>
          </div>
        </div>

        {/* Portfolio Distribution Pie Chart */}
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Alokasi Portofolio Asset</h3>
          {chartData.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Belum ada data portofolio
            </div>
          ) : (
            <div style={{ height: '160px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Asset Accounts Grid Breakdown */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-color)' }}>
          Rincian Instumen Asset & Tabungan
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {accountBalances.map((item, idx) => {
            const share = totalPortfolioValue > 0 ? item.net / totalPortfolioValue : 0;
            return (
              <div
                key={item.name}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.2s'
                }}
              >
                <div className="flex-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AccountLogo name={item.name} size={18} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-brand)', background: 'rgba(99, 102, 241, 0.12)', padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                    {formatPercent(share)}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saldo Asset</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: 'var(--accent-income)' }}>
                    {formatCurrency(item.net)}
                  </div>
                </div>

                {/* Progress bar ratio */}
                <div style={{ height: '6px', background: 'var(--bg-tab)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(share * 100, 100)}%`, height: '100%', background: COLORS[idx % COLORS.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Asset Modal */}
      {showAddAssetModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddAssetModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>+ Tambah Instrument Asset / Tabungan</h2>
            <form onSubmit={handleAddAssetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>Nama Platform / Asset</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Cth: Stockbit, Ajaib, Bibit, Pluang, Married"
                  value={assetName}
                  onChange={e => setAssetName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Jumlah Nominal Initial (Rp)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="1,000,000"
                  value={assetAmount}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setAssetAmount(raw ? Number(raw).toLocaleString('en-US') : '');
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1, border: '1px solid var(--border-color)' }} onClick={() => setShowAddAssetModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Simpan Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
