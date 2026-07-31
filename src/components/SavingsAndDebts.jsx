import React, { useState } from 'react';
import { useStore } from '../store/useStore.jsx';
import { PiggyBank, CreditCard, Plus, Trash2, Shield, TrendingUp, Plane, CheckCircle2, DollarSign, Calendar } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

export default function SavingsAndDebts() {
  const { savingsGoals, addSavingsGoal, depositSavingsGoal, deleteSavingsGoal, debts, addDebt, payDebt, deleteDebt, t } = useStore();

  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);

  const [newSavings, setNewSavings] = useState({ name: '', target: '', current: '' });
  const [newDebt, setNewDebt] = useState({ name: '', total: '', paid: '', dueDate: '' });

  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  const [payDebtId, setPayDebtId] = useState(null);
  const [payAmount, setPayAmount] = useState('');

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
    if (!newSavings.name || !newSavings.target) return;
    addSavingsGoal({
      name: newSavings.name,
      target: Number(newSavings.target),
      current: Number(newSavings.current || 0),
      color: '#10b981'
    });
    setNewSavings({ name: '', target: '', current: '' });
    setShowSavingsModal(false);
  };

  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.total) return;
    addDebt({
      name: newDebt.name,
      total: Number(newDebt.total),
      paid: Number(newDebt.paid || 0),
      dueDate: newDebt.dueDate || 'Setiap Bulan',
      color: '#ef4444'
    });
    setNewDebt({ name: '', total: '', paid: '', dueDate: '' });
    setShowDebtModal(false);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) return;
    depositSavingsGoal(depositGoalId, Number(depositAmount));
    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handlePayDebtSubmit = (e) => {
    e.preventDefault();
    if (!payDebtId || !payAmount) return;
    payDebt(payDebtId, Number(payAmount));
    setPayDebtId(null);
    setPayAmount('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Hero Cards */}
      <div className="grid-cols-2">
        {/* Savings Total Hero Card */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#10b981', color: 'white', padding: '0.6rem', borderRadius: '12px' }}>
                <PiggyBank size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('savingsTitle')}</h3>
                <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{t('currentAmount')}: {formatCurrency(totalSavingsCurrent)}</p>
              </div>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', background: '#10b981' }} onClick={() => setShowSavingsModal(true)}>
              <Plus size={16} /> {t('addSavings')}
            </button>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 600 }}>
              <span>Target: {formatCurrency(totalSavingsTarget)}</span>
              <span className="text-income">{totalSavingsProgress.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(totalSavingsProgress, 100)}%`, background: '#10b981', height: '100%', borderRadius: '10px', transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>

        {/* Debts Total Hero Card */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#ef4444', color: 'white', padding: '0.6rem', borderRadius: '12px' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('debtsTitle')}</h3>
                <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{t('remainingAmount')}: <span style={{ color: '#ef4444', fontWeight: 700 }}>{formatCurrency(totalDebtRemaining)}</span></p>
              </div>
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', background: '#ef4444' }} onClick={() => setShowDebtModal(true)}>
              <Plus size={16} /> {t('addDebt')}
            </button>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.35rem', fontWeight: 600 }}>
              <span>Terbayar: {formatCurrency(totalDebtPaid)} / {formatCurrency(totalDebtAmount)}</span>
              <span style={{ color: '#f59e0b' }}>{totalDebtProgress.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '10px', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(totalDebtProgress, 100)}%`, background: '#f59e0b', height: '100%', borderRadius: '10px', transition: 'width 0.5s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Savings & Investments List */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem' }}>{t('savingsTitle')}</h3>
        <div className="grid-cols-3">
          {savingsGoals.map(goal => {
            const prog = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
            return (
              <div key={goal.id} className="glass-card" style={{ padding: '1.2rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{goal.name}</h4>
                  <button onClick={() => deleteSavingsGoal(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>
                  {formatCurrency(goal.current)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Target: {formatCurrency(goal.target)}
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                  <div style={{ width: `${Math.min(prog, 100)}%`, background: '#10b981', height: '100%' }} />
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
                  <button onClick={() => deleteDebt(debt.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Terbayar: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(debt.paid)}</strong></span>
                  <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 700 }}>Sisa: {formatCurrency(remaining)}</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.85rem' }}>
                  <div style={{ width: `${Math.min(prog, 100)}%`, background: prog >= 100 ? '#10b981' : '#f59e0b', height: '100%' }} />
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
                <label>Nama Target / Investasi</label>
                <input type="text" className="input-field" placeholder="Cth: Tabungan Mobil" value={newSavings.name} onChange={e => setNewSavings({...newSavings, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Target Nominal (Rp)</label>
                <input type="number" className="input-field" placeholder="10,000,000" value={newSavings.target} onChange={e => setNewSavings({...newSavings, target: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Nominal Saat Ini (Rp)</label>
                <input type="number" className="input-field" placeholder="0" value={newSavings.current} onChange={e => setNewSavings({...newSavings, current: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowSavingsModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>Simpan</button>
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
                <label>Nama Cicilan / Hutang</label>
                <input type="text" className="input-field" placeholder="Cth: Cicilan HP" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Total Hutang (Rp)</label>
                <input type="number" className="input-field" placeholder="5,000,000" value={newDebt.total} onChange={e => setNewDebt({...newDebt, total: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Sudah Terbayar (Rp)</label>
                <input type="number" className="input-field" placeholder="0" value={newDebt.paid} onChange={e => setNewDebt({...newDebt, paid: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Jatuh Tempo</label>
                <input type="text" className="input-field" placeholder="Cth: Tanggal 15" value={newDebt.dueDate} onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowDebtModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#ef4444' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Savings Modal */}
      {depositGoalId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDepositGoalId(null)}>
          <div className="modal-content">
            <h3 style={{ marginBottom: '1rem' }}>Tambah Setoran Tabungan</h3>
            <form onSubmit={handleDepositSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div className="input-group">
                <label>Nominal Setor (Rp)</label>
                <input type="number" className="input-field" placeholder="500,000" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setDepositGoalId(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>Setor</button>
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
