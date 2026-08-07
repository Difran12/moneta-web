import React, { useState } from 'react';
import { useStore } from '../store/useStore.jsx';
import AccountLogo from './AccountLogo';
import SearchableAccountSelect from './SearchableAccountSelect';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Landmark, CreditCard, Plus, Trash2, Shield, TrendingUp, Plane, CheckCircle2, DollarSign, Calendar, Coins, Pencil, X } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

export default function SavingsAndDebts() {
  const { savingsGoals, addSavingsGoal, depositSavingsGoal, deleteSavingsGoal, debts, addDebt, payDebt, deleteDebt, updateDebt, t, allocations, transactions, selectedMonth, selectedYear, accounts, lang, showToast, showConfirm } = useStore();

  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);

  const [newSavings, setNewSavings] = useState({ name: '', target: '', current: '', account: '' });
  const [newDebt, setNewDebt] = useState({ name: '', total: '', paid: '', dueDate: '' });
  const [editingDebt, setEditingDebt] = useState(null);

  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [payDebtId, setPayDebtId] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  // Transactions calculations for Envelopes
  const currentMonthTransactions = transactions.filter(tItem => {
    const d = new Date(tItem.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
  const totalIncome = currentMonthTransactions.filter(tItem => tItem.type === 'income').reduce((sum, tItem) => sum + tItem.amount, 0);

  // Totals calculations
  const totalSavingsTarget = savingsGoals.reduce((acc, curr) => acc + Number(curr.target), 0);
  const totalSavingsCurrent = savingsGoals.reduce((acc, curr) => acc + Number(curr.current), 0);
  const totalSavingsProgress = totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0;

  const totalDebtAmount = debts.reduce((acc, curr) => acc + Number(curr.total), 0);
  const totalDebtPaid = debts.reduce((acc, curr) => acc + Number(curr.paid), 0);
  const totalDebtRemaining = totalDebtAmount - totalDebtPaid;
  const totalDebtProgress = totalDebtAmount > 0 ? (totalDebtPaid / totalDebtAmount) * 100 : 0;

  const handleAddSavings = (e) => {
    e.preventDefault();
    if (!newSavings.name || !newSavings.target) {
      showToast(lang === 'en' ? 'Please complete all required fields!' : 'Mohon lengkapi nama dan target tabungan!', 'warning');
      return;
    }
    addSavingsGoal({
      name: newSavings.name,
      target: Number(newSavings.target),
      current: Number(newSavings.current || 0),
      account: newSavings.account,
      color: '#10b981'
    });
    showToast(lang === 'en' ? `Savings goal "${newSavings.name}" added!` : `Target tabungan "${newSavings.name}" berhasil ditambahkan!`, 'success');
    setNewSavings({ name: '', target: '', current: '', account: '' });
    setShowSavingsModal(false);
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.total) {
      showToast(lang === 'en' ? 'Please complete all required fields!' : 'Mohon lengkapi nama dan total cicilan!', 'warning');
      return;
    }
    addDebt({
      name: newDebt.name,
      total: Number(newDebt.total),
      paid: Number(newDebt.paid || 0),
      dueDate: newDebt.dueDate || 'Setiap Bulan',
      color: '#ef4444'
    });
    showToast(lang === 'en' ? `Debt item "${newDebt.name}" added!` : `Catatan utang "${newDebt.name}" berhasil ditambahkan!`, 'success');
    setNewDebt({ name: '', total: '', paid: '', dueDate: '' });
    setShowDebtModal(false);
  };

  const handleEditDebtSubmit = (e) => {
    e.preventDefault();
    if (!editingDebt.name || !editingDebt.total) {
      showToast(lang === 'en' ? 'Please complete all required fields!' : 'Mohon lengkapi nama dan total cicilan!', 'warning');
      return;
    }
    updateDebt({
      ...editingDebt,
      total: Number(editingDebt.total),
      paid: Number(editingDebt.paid || 0),
    });
    showToast(lang === 'en' ? `Debt item "${editingDebt.name}" updated!` : `Catatan utang "${editingDebt.name}" berhasil diperbarui!`, 'success');
    setEditingDebt(null);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) {
      showToast(lang === 'en' ? 'Please enter deposit amount!' : 'Mohon masukkan nominal setor!', 'warning');
      return;
    }
    depositSavingsGoal(depositGoalId, Number(depositAmount));
    showToast(lang === 'en' ? 'Deposit recorded successfully!' : 'Setoran tabungan berhasil dicatat!', 'success');
    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handlePayDebtSubmit = (e) => {
    e.preventDefault();
    if (!payDebtId || !payAmount) {
      showToast(lang === 'en' ? 'Please enter payment amount!' : 'Mohon masukkan nominal bayar!', 'warning');
      return;
    }
    payDebt(payDebtId, Number(payAmount));
    showToast(lang === 'en' ? 'Debt payment recorded successfully!' : 'Pembayaran cicilan berhasil dicatat!', 'success');
    setPayDebtId(null);
    setPayAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Hero Cards */}
      <div className="grid-cols-2">
        <div className="glass-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{ background: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                <Landmark size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.2rem' }}>{t('savingsTitle')}</h3>
                <p className="text-secondary" style={{ fontSize: '0.75rem' }}>{t('collected')}: {formatCurrency(totalSavingsCurrent)}</p>
              </div>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#10b981', flexShrink: 0 }} onClick={() => setShowSavingsModal(true)}>
              <Plus size={14} style={{ marginRight: '0.25rem' }} /> {t('addSavings')}
            </button>
          </div>
          
          <div>
            <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 600 }}>
              <span className="text-secondary">{t('target')}: {formatCurrency(totalSavingsTarget)}</span>
              <span className="text-income">{totalSavingsProgress.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', background: 'var(--bg-panel)', height: '6px', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ width: `${Math.min(totalSavingsProgress, 100)}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', height: '100%', borderRadius: '6px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
          </div>
        </div>

        {/* Debts Total Hero Card */}
        <div className="glass-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{ background: '#ef4444', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                <CreditCard size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.2rem' }}>{t('debtsTitle')}</h3>
                <p className="text-secondary" style={{ fontSize: '0.75rem' }}>{t('remainingDebt')}: <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(totalDebtRemaining)}</span></p>
              </div>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', background: '#ef4444', flexShrink: 0 }} onClick={() => setShowDebtModal(true)}>
              <Plus size={14} style={{ marginRight: '0.25rem' }} /> {t('addDebt')}
            </button>
          </div>

          <div>
            <div className="flex-between" style={{ fontSize: '0.75rem', marginBottom: '0.4rem', fontWeight: 600 }}>
              <span className="text-secondary">{t('paidAmount')}: {formatCurrency(totalDebtPaid)} / {formatCurrency(totalDebtAmount)}</span>
              <span style={{ color: '#f59e0b' }}>{totalDebtProgress.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', background: 'var(--bg-panel)', height: '6px', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ width: `${Math.min(totalDebtProgress, 100)}%`, background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', height: '100%', borderRadius: '6px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Envelopes (Budgeting Allocations) */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('envelopeManagement')}</h3>
            <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{t('envelopeSubtitle')} (Total: {formatCurrency(totalIncome)})</p>
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            {allocations.reduce((sum, a) => sum + a.percent, 0)}% {t('distributed')}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {allocations.map(alloc => {
            const alokasiAmount = (alloc.percent / 100) * totalIncome;
            const realisasiAmount = currentMonthTransactions
              .filter(tItem => tItem.type === 'expense' && tItem.category === alloc.name)
              .reduce((sum, tItem) => sum + tItem.amount, 0);
            const sisa = alokasiAmount - realisasiAmount;
            const prog = alokasiAmount > 0 ? (realisasiAmount / alokasiAmount) * 100 : 0;
            const isOverBudget = realisasiAmount > alokasiAmount;

            return (
              <div key={alloc.id} style={{ background: 'var(--bg-input)', border: `1px solid ${isOverBudget ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-color)'}`, borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: alloc.color || '#3b82f6' }} />
                
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {alloc.name}
                    <span style={{ background: 'var(--bg-panel)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', color: alloc.color || '#3b82f6' }}>{alloc.percent}%</span>
                  </h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isOverBudget ? '#ef4444' : 'var(--text-secondary)' }}>
                    {prog.toFixed(1)}%
                  </span>
                </div>
                
                <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>
                  {formatCurrency(realisasiAmount)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>/ {formatCurrency(alokasiAmount)}</span>
                </div>
                
                <div style={{ fontSize: '0.75rem', color: isOverBudget ? '#ef4444' : 'var(--accent-income)', marginBottom: '0.85rem', fontWeight: 600 }}>
                  {isOverBudget ? `${t('overBudget')}: ` : `${t('remainingEnvelope')}: `} 
                  {formatCurrency(Math.abs(sisa))}
                </div>

                <div style={{ width: '100%', background: 'var(--bg-panel)', height: '6px', borderRadius: '6px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: `${Math.min(prog, 100)}%`, background: isOverBudget ? 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)' : `linear-gradient(90deg, ${alloc.color || '#3b82f6'} 0%, ${alloc.color || '#60a5fa'}88 100%)`, height: '100%', borderRadius: '6px', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: isOverBudget ? '0 0 10px rgba(239, 68, 68, 0.5)' : `0 0 10px ${alloc.color || '#3b82f6'}88` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings & Investments List + Portfolio Distribution Chart */}
      <div className="glass-card">
        <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('savingsTitle')}</h3>
            <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{t('portfolioDesc')}</p>
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            {savingsGoals.length} {t('targetPortfolio')}
          </span>
        </div>

        {/* Portfolio Distribution Pie Chart */}
        {savingsGoals.length > 0 && (
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 200px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>{t('portfolioDistribution')}</h4>
              <p className="text-secondary" style={{ fontSize: '0.78rem' }}>{t('portfolioRatio')}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', marginTop: '0.75rem' }}>
                {savingsGoals.map((g, idx) => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: g.color || ['#6366F1', '#10B981', '#EC4899', '#06B6D4'][idx % 4] }} />
                    <AccountLogo name={g.name} size={12} />
                    <span>{g.name}:</span>
                    <strong style={{ color: 'var(--accent-income)' }}>{formatCurrency(g.current)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: '160px', height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={savingsGoals.map(g => ({ name: g.name, value: Number(g.current || 0) }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {savingsGoals.map((g, idx) => (
                      <Cell key={g.id} fill={g.color || ['#6366F1', '#10B981', '#EC4899', '#06B6D4'][idx % 4]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid-cols-3">
          {savingsGoals.map(goal => {
            const prog = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            return (
              <div key={goal.id} className="glass-card" style={{ padding: '1.2rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AccountLogo name={goal.name} size={16} />
                    <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{goal.name}</h4>
                  </div>
                  <button 
                    onClick={() => {
                      showConfirm({
                        title: lang === 'en' ? 'Delete Savings Goal' : 'Hapus Target Tabungan',
                        message: lang === 'en' ? `Delete savings goal "${goal.name}"?` : `Apakah Anda yakin ingin menghapus target tabungan "${goal.name}"?`,
                        onConfirm: () => {
                          deleteSavingsGoal(goal.id);
                          showToast(lang === 'en' ? `Savings goal "${goal.name}" deleted` : `Target tabungan "${goal.name}" berhasil dihapus`, 'danger');
                        }
                      });
                    }} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>
                  {formatCurrency(goal.current)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {t('target')}: {formatCurrency(goal.target)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <span>{prog.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg-panel)', height: '8px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.85rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: `${Math.min(prog, 100)}%`, background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', height: '100%', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }} />
                </div>
                <button className="btn" style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }} onClick={() => setDepositGoalId(goal.id)}>
                  + {t('addDeposit')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Debts & Installments List */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem' }}>{t('debtsTitle')}</h3>
        <div className="grid-cols-2">
          {debts.map(debt => {
            const prog = debt.total > 0 ? (debt.paid / debt.total) * 100 : 0;
            const remaining = debt.total - debt.paid;
            return (
              <div key={debt.id} className="glass-card" style={{ padding: '1.2rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{debt.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}><Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />{t('dueDate')}: {debt.dueDate}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.2rem' }}>
                    <button 
                      onClick={() => setEditingDebt(debt)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.35rem', borderRadius: '8px' }}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        showConfirm({
                          title: lang === 'en' ? 'Delete Debt Item' : 'Hapus Catatan Utang',
                          message: lang === 'en' ? `Delete debt item "${debt.name}"?` : `Apakah Anda yakin ingin menghapus utang/cicilan "${debt.name}"?`,
                          onConfirm: () => {
                            deleteDebt(debt.id);
                            showToast(lang === 'en' ? `Debt item "${debt.name}" deleted` : `Catatan utang "${debt.name}" berhasil dihapus`, 'danger');
                          }
                        });
                      }} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)', padding: '0.35rem', borderRadius: '8px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('paidAmount')}: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(debt.paid)}</strong></span>
                  <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>{t('remainingDebt')}: {formatCurrency(remaining)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <span>{prog.toFixed(1)}%</span>
                </div>
                <div style={{ width: '100%', background: 'var(--bg-panel)', height: '8px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.85rem', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ width: `${Math.min(prog, 100)}%`, background: prog >= 100 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', height: '100%', transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: prog >= 100 ? '0 0 10px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(245, 158, 11, 0.5)' }} />
                </div>
                {remaining > 0 ? (
                  <button className="btn" style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={() => setPayDebtId(debt.id)}>
                    💳 {t('payInstallment')}
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', padding: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '8px' }}>
                    ✓ LUNAS
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Savings Modal */}
      {showSavingsModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowSavingsModal(false)}>
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>{t('addSavings')}</h3>
            <form onSubmit={handleAddSavings} style={{ display: 'grid', gap: '1rem' }}>
              <div className="input-group">
                <label>{t('investmentName')}</label>
                <input type="text" className="input-field" placeholder="Cth: Tabungan Mobil" value={newSavings.name} onChange={e => setNewSavings({...newSavings, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>{t('targetNominal')}</label>
                <input type="number" className="input-field" placeholder="10,000,000" value={newSavings.target} onChange={e => setNewSavings({...newSavings, target: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>{t('currentNominal')}</label>
                <input type="number" className="input-field" placeholder="0" value={newSavings.current} onChange={e => setNewSavings({...newSavings, current: e.target.value})} />
              </div>
              <div className="input-group">
                <label>{t('walletStorage')}</label>
                <SearchableAccountSelect 
                  accounts={accounts} 
                  value={newSavings.account} 
                  onChange={val => setNewSavings({...newSavings, account: val})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowSavingsModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>{t('saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showDebtModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDebtModal(false)}>
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>{t('addDebt')}</h3>
            <form onSubmit={handleAddDebt} style={{ display: 'grid', gap: '1rem' }}>
              <div className="input-group">
                <label>{t('debtName')}</label>
                <input type="text" className="input-field" placeholder="Cth: Cicilan HP" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>{t('totalDebtInput')}</label>
                <input type="number" className="input-field" placeholder="5,000,000" value={newDebt.total} onChange={e => setNewDebt({...newDebt, total: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>{t('alreadyPaidInput')}</label>
                <input type="number" className="input-field" placeholder="0" value={newDebt.paid} onChange={e => setNewDebt({...newDebt, paid: e.target.value})} />
              </div>
              <div className="input-group">
                <label>{t('dueDate')}</label>
                <input type="text" className="input-field" placeholder="Cth: Tanggal 15" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowDebtModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#ef4444' }}>{t('saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Debt Modal */}
      {editingDebt && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingDebt(null)}>
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit Cicilan / Hutang</h3>
              <button onClick={() => setEditingDebt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditDebtSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div className="input-group">
                <label>{t('debtName')}</label>
                <input type="text" className="input-field" value={editingDebt.name} onChange={e => setEditingDebt({...editingDebt, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>{t('totalDebtInput')}</label>
                <input type="number" className="input-field" value={editingDebt.total} onChange={e => setEditingDebt({...editingDebt, total: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>{t('alreadyPaidInput')}</label>
                <input type="number" className="input-field" value={editingDebt.paid} onChange={e => setEditingDebt({...editingDebt, paid: e.target.value})} />
              </div>
              <div className="input-group">
                <label>{t('dueDate')}</label>
                <input type="text" className="input-field" value={editingDebt.dueDate} onChange={e => setEditingDebt({...editingDebt, dueDate: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setEditingDebt(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#ef4444' }}>{t('saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Savings Modal */}
      {depositGoalId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDepositGoalId(null)}>
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>{t('addDepositTitle')}</h3>
            <form onSubmit={handleDepositSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div className="input-group">
                <label>{t('depositNominal')}</label>
                <input type="number" className="input-field" placeholder="500,000" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setDepositGoalId(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>{t('saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Debt Modal */}
      {payDebtId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setPayDebtId(null)}>
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>Bayar Cicilan / Hutang</h3>
            <form onSubmit={handlePayDebtSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div className="input-group">
                <label>Nominal Pembayaran (Rp)</label>
                <input type="number" className="input-field" placeholder="500,000" value={payAmount} onChange={e => setPayAmount(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setPayDebtId(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#ef4444' }}>Bayar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
