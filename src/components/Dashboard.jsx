import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore.jsx';
import AccountLogo from './AccountLogo';
import SearchableAccountSelect from './SearchableAccountSelect';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Trash2, Pencil, X, AlertCircle, Wallet, DollarSign, ChevronDown, PieChart as PieChartIcon, Plus, Landmark, CreditCard, Coins, Shield, CheckCircle2 } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatPercent = (percent) => {
  return new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(percent);
};

const formatMonetaYAxis = (val) => {
  if (!val || val === 0) return 'Rp 0';
  const prefix = val > 0 ? '+' : '-';
  const absVal = Math.abs(val);
  if (absVal >= 1000000000) return `${prefix}Rp${(absVal / 1000000000).toFixed(1)}B`;
  if (absVal >= 1000000) return `${prefix}Rp${(absVal / 1000000).toFixed(1)}M`;
  if (absVal >= 1000) return `${prefix}Rp${(absVal / 1000).toFixed(0)}k`;
  return `${prefix}Rp${absVal}`;
};

const CustomMonetaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const inc = payload.find(p => p.dataKey === 'income')?.value || 0;
    const exp = Math.abs(payload.find(p => p.dataKey === 'expenseInverted')?.value || 0);

    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        padding: '0.65rem 1.1rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 12px 35px -5px rgba(0, 0, 0, 0.6)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          <span style={{ color: '#10b981' }}>+{formatCurrency(inc)}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: '#ef4444' }}>-{formatCurrency(exp)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Dashboard() {
  const { 
    transactions, 
    deleteTransaction: deleteTxStore, 
    updateTransaction, 
    accounts, 
    incomeCategories, 
    allocations, 
    savingsGoals, 
    addSavingsGoal, 
    depositSavingsGoal, 
    deleteSavingsGoal, 
    debts, 
    initialBalances, 
    updateInitialBalance,
    deleteInitialBalance,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    lang,
    t,
    showToast,
    showConfirm,
    addAccount, 
    deleteAccount 
  } = useStore();
  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ID;
  
  const currentDate = new Date();
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'

  const selectedDateObj = useMemo(() => new Date(selectedYear, selectedMonth, selectedDay), [selectedYear, selectedMonth, selectedDay]);
  const dayName = useMemo(() => {
    return selectedDateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { weekday: 'long' });
  }, [selectedDateObj, lang]);

  // Edit Transaction State
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({ type: 'expense', amount: '', category: '', account: '', note: '', date: '' });
  const [editError, setEditError] = useState('');

  // Edit Initial Balance State
  const [editingWallet, setEditingWallet] = useState(null);
  const [walletInitialInput, setWalletInitialInput] = useState('');

  // Add Wallet State
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletInitial, setNewWalletInitial] = useState('');
  
  // Investment Instrument Modals
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);
  const [newInvestment, setNewInvestment] = useState({ name: '', target: '', current: '', account: '' });
  const [depositGoalId, setDepositGoalId] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Collapsible state for Cash Flow by Account
  const [showCashFlowByAccount, setShowCashFlowByAccount] = useState(false);

  // Transaction Detail Modal State
  const [selectedDetailTx, setSelectedDetailTx] = useState(null);


  const deleteTransaction = (id) => {
    showConfirm({
      title: lang === 'en' ? 'Delete Transaction' : 'Hapus Transaksi',
      message: lang === 'en' ? 'Are you sure you want to delete this transaction? This action cannot be undone.' : 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: () => {
        deleteTxStore(id);
        showToast(lang === 'en' ? 'Transaction deleted' : 'Transaksi berhasil dihapus', 'danger');
      }
    });
  };

  const startEdit = (tItem) => {
    const d = new Date(tItem.date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const dateStr = d.toISOString().slice(0, 16);

    setEditingTx(tItem);
    setEditForm({
      type: tItem.type,
      amount: tItem.amount.toLocaleString('en-US'),
      category: tItem.category,
      account: tItem.account || accounts[0] || '',
      note: tItem.note || '',
      date: dateStr
    });
    setEditError('');
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setEditError('');
    const rawAmount = Number((editForm.amount || '').toString().replace(/,/g, ''));
    
    if (!rawAmount || rawAmount <= 0) {
      setEditError(t('invalidAmountError'));
      return;
    }
    if (!editForm.category) {
      setEditError(t('invalidCategoryError'));
      return;
    }
    if (!editForm.account) {
      setEditError(t('invalidAccountError'));
      return;
    }
    if (!editForm.date) {
      setEditError(t('invalidDateError'));
      return;
    }

    updateTransaction({
      ...editingTx,
      ...editForm,
      amount: rawAmount
    });
    showToast(lang === 'en' ? 'Transaction updated successfully!' : 'Transaksi berhasil diperbarui!', 'success');
    setEditingTx(null);
    setEditError('');
  };

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    years.add(currentDate.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentDate]);

  // Helper to filter transaction based on active timeframe
  const isMatchTimeframe = useCallback((dateStr) => {
    const d = new Date(dateStr);
    
    if (timeframe === 'daily') {
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === selectedDay;
    } else if (timeframe === 'weekly') {
      const targetDate = new Date(selectedYear, selectedMonth, selectedDay);
      const diffTime = Math.abs(targetDate - d);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } else if (timeframe === 'monthly') {
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    } else if (timeframe === 'yearly') {
      return d.getFullYear() === selectedYear;
    }
    return true;
  }, [timeframe, selectedYear, selectedMonth, selectedDay]);

  // Calculate summary data for selected timeframe
  const { totalIncome, totalRealisasi, categoryData } = useMemo(() => {
    let income = 0;
    const catExpenses = {};

    transactions.forEach(t => {
      if (isMatchTimeframe(t.date)) {
        if (t.type === 'income') {
          income += t.amount;
        } else if (t.type === 'expense') {
          catExpenses[t.category] = (catExpenses[t.category] || 0) + t.amount;
        }
      }
    });

    let realisasi = 0;
    const data = allocations.map(alloc => {
      const alokasi = (income * alloc.percent) / 100;
      const real = catExpenses[alloc.name] || 0;
      realisasi += real;
      const progress = alokasi > 0 ? real / alokasi : 0;
      return {
        ...alloc,
        alokasi,
        realisasi: real,
        progress,
        overbudget: real > alokasi
      };
    });

    return { totalIncome: income, totalRealisasi: realisasi, categoryData: data };
  }, [transactions, allocations, isMatchTimeframe]);

  // Generate chart data dynamically based on timeframe
  const lineChartData = useMemo(() => {
    const data = [];
    
    if (timeframe === 'daily') {
      // 24-hour slots breakdown for selected day (04:00, 08:00, 12:00, 16:00, 20:00, 24:00)
      const hoursSlots = ['04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
      const slotIncome = [0, 0, 0, 0, 0, 0];
      const slotExpense = [0, 0, 0, 0, 0, 0];

      transactions.forEach(t => {
        const tDate = new Date(t.date);
        if (tDate.getFullYear() === selectedYear && tDate.getMonth() === selectedMonth && tDate.getDate() === selectedDay) {
          const hour = tDate.getHours();
          const slotIndex = Math.min(Math.floor(hour / 4), 5);
          if (t.type === 'income') slotIncome[slotIndex] += t.amount;
          else slotExpense[slotIndex] += t.amount;
        }
      });

      hoursSlots.forEach((slot, idx) => {
        data.push({
          day: slot,
          income: slotIncome[idx],
          expenseInverted: -slotExpense[idx]
        });
      });
    } else if (timeframe === 'weekly') {
      const days = 7;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(selectedYear, selectedMonth, selectedDay);
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { weekday: 'short', day: 'numeric' });
        
        let inc = 0;
        let exp = 0;
        transactions.forEach(t => {
          const tDate = new Date(t.date);
          if (tDate.toDateString() === d.toDateString()) {
            if (t.type === 'income') inc += t.amount;
            else exp += t.amount;
          }
        });
        
        data.push({
          day: dayLabel,
          income: inc,
          expenseInverted: -exp
        });
      }
    } else if (timeframe === 'yearly') {
      for (let m = 0; m < 12; m++) {
        let inc = 0;
        let exp = 0;
        transactions.forEach(t => {
          const tDate = new Date(t.date);
          if (tDate.getFullYear() === selectedYear && tDate.getMonth() === m) {
            if (t.type === 'income') inc += t.amount;
            else exp += t.amount;
          }
        });
        
        data.push({
          day: MONTHS[m].slice(0, 3),
          income: inc,
          expenseInverted: -exp
        });
      }
    } else {
      // Monthly (default)
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const dailyExpenses = {};
      const dailyIncome = {};
      
      transactions.forEach(t => {
        const date = new Date(t.date);
        if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
          const day = date.getDate();
          if (t.type === 'expense') {
            dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount;
          } else {
            dailyIncome[day] = (dailyIncome[day] || 0) + t.amount;
          }
        }
      });

      for (let i = 1; i <= daysInMonth; i++) {
        data.push({
          day: i.toString(),
          income: dailyIncome[i] || 0,
          expenseInverted: -(dailyExpenses[i] || 0)
        });
      }
    }
    return data;
  }, [transactions, selectedYear, selectedMonth, selectedDay, timeframe, lang, t, MONTHS]);

  const totalAlokasi = totalIncome;
  const saldo = totalIncome - totalRealisasi;
  const totalPercent = totalAlokasi > 0 ? totalRealisasi / totalAlokasi : 0;

  // Compute manual overall wallet balances (100% Manual input as requested by user)
  const walletBalances = useMemo(() => {
    return accounts
      .filter(acc => initialBalances.hasOwnProperty(acc))
      .map(acc => {
        const val = Number(initialBalances[acc] || 0);
        return {
          name: acc,
          initial: val,
          current: val
        };
      });
  }, [accounts, initialBalances]);

  const totalAssets = walletBalances.reduce((sum, item) => sum + item.current, 0);

  // Compute Net Worth & Investment Portfolio Totals
  const totalLiquidCash = useMemo(() => {
    return walletBalances.reduce((sum, item) => sum + item.current, 0);
  }, [walletBalances]);

  const totalInvestmentPortfolio = useMemo(() => {
    return savingsGoals.reduce((sum, item) => sum + Number(item.current || 0), 0);
  }, [savingsGoals]);

  const totalInvestmentTarget = useMemo(() => {
    return savingsGoals.reduce((sum, item) => sum + Number(item.target || 0), 0);
  }, [savingsGoals]);

  const totalDebtRemaining = useMemo(() => {
    return debts.reduce((sum, item) => sum + Math.max(0, Number(item.total || 0) - Number(item.paid || 0)), 0);
  }, [debts]);

  const netWorth = useMemo(() => {
    return totalLiquidCash + totalInvestmentPortfolio - totalDebtRemaining;
  }, [totalLiquidCash, totalInvestmentPortfolio, totalDebtRemaining]);

  // Compute timeframe-based cash flow breakdown per account
  const periodAccountBalances = useMemo(() => {
    const map = {};
    accounts.forEach(acc => {
      map[acc] = { income: 0, expense: 0, net: 0 };
    });

    transactions.forEach(tItem => {
      if (!isMatchTimeframe(tItem.date)) return;
      const acc = tItem.account;
      if (!acc) return;
      if (!map[acc]) {
        map[acc] = { income: 0, expense: 0, net: 0 };
      }
      if (tItem.type === 'income') {
        map[acc].income += tItem.amount;
      } else if (tItem.type === 'expense') {
        map[acc].expense += tItem.amount;
      }
      map[acc].net = map[acc].income - map[acc].expense;
    });

    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data
    }));
  }, [accounts, transactions, isMatchTimeframe]);

  const handleAddInvestmentSubmit = (e) => {
    e.preventDefault();
    if (!newInvestment.name || !newInvestment.target) {
      showToast(lang === 'en' ? 'Please complete all required fields!' : 'Mohon lengkapi nama dan target!', 'warning');
      return;
    }
    addSavingsGoal({
      name: newInvestment.name,
      target: Number(newInvestment.target),
      current: Number(newInvestment.current || 0),
      account: newInvestment.account || newInvestment.name,
      color: '#10b981'
    });
    showToast(lang === 'en' ? `Investment "${newInvestment.name}" added!` : `Instrumen investasi "${newInvestment.name}" berhasil ditambahkan!`, 'success');
    setNewInvestment({ name: '', target: '', current: '', account: '' });
    setShowAddInvestmentModal(false);
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositGoalId || !depositAmount) {
      showToast(lang === 'en' ? 'Please enter deposit amount!' : 'Mohon masukkan nominal setor!', 'warning');
      return;
    }
    depositSavingsGoal(depositGoalId, Number(depositAmount));
    showToast(lang === 'en' ? 'Deposit recorded successfully!' : 'Setoran investasi berhasil dicatat!', 'success');
    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handleSaveInitialBalance = (e) => {
    e.preventDefault();
    if (!editingWallet) return;
    const numericVal = Number(walletInitialInput.replace(/\D/g, ''));
    updateInitialBalance(editingWallet, numericVal);
    showToast(lang === 'en' ? `Wallet balance for "${editingWallet}" updated!` : `Saldo dompet "${editingWallet}" berhasil diperbarui!`, 'success');
    setEditingWallet(null);
  };

  const handleAddNewWallet = (e) => {
    e.preventDefault();
    if (!newWalletName.trim()) {
      showToast(lang === 'en' ? 'Please select a wallet!' : 'Mohon pilih dompet!', 'warning');
      return;
    }
    if (walletBalances.some(w => w.name === newWalletName.trim())) {
      showToast(lang === 'en' ? 'Wallet is already on the dashboard!' : 'Dompet sudah ada di pantauan dashboard!', 'warning');
      return;
    }
    
    // Just update initial balance to add it to dashboard (since it's already in settings)
    const numericVal = newWalletInitial ? Number(newWalletInitial.replace(/\D/g, '')) : 0;
    updateInitialBalance(newWalletName.trim(), numericVal);
    
    showToast(lang === 'en' ? `Wallet "${newWalletName.trim()}" added to dashboard!` : `Dompet "${newWalletName.trim()}" berhasil ditambahkan ke pantauan!`, 'success');
    setNewWalletName('');
    setNewWalletInitial('');
    setShowAddWalletModal(false);
  };

  const dynamicPeriodText = useMemo(() => {
    if (timeframe === 'daily') {
      return lang === 'en' ? `${dayName}, ${MONTHS[selectedMonth]} ${selectedDay}` : `${dayName}, ${selectedDay} ${MONTHS[selectedMonth]}`;
    } else if (timeframe === 'weekly') {
      const weekOfMonth = Math.ceil(selectedDay / 7);
      return lang === 'en' ? `Week ${weekOfMonth} of ${MONTHS[selectedMonth]} ${selectedYear}` : `Minggu ke-${weekOfMonth} ${MONTHS[selectedMonth]} ${selectedYear}`;
    } else if (timeframe === 'yearly') {
      return selectedYear.toString();
    }
    return `${MONTHS[selectedMonth]} ${selectedYear}`;
  }, [timeframe, lang, dayName, selectedDay, selectedMonth, selectedYear, MONTHS]);

  const dynamicPeriodTextFull = useMemo(() => {
    if (timeframe === 'daily') {
      return lang === 'en' ? `${dayName}, ${MONTHS[selectedMonth]} ${selectedDay}, ${selectedYear}` : `${dayName}, ${selectedDay} ${MONTHS[selectedMonth]} ${selectedYear}`;
    } else if (timeframe === 'weekly') {
      const weekOfMonth = Math.ceil(selectedDay / 7);
      return lang === 'en' ? `Week ${weekOfMonth} of ${MONTHS[selectedMonth]} ${selectedYear}` : `Minggu ke-${weekOfMonth} ${MONTHS[selectedMonth]} ${selectedYear}`;
    } else if (timeframe === 'yearly') {
      return lang === 'en' ? `Year ${selectedYear}` : `Tahun ${selectedYear}`;
    }
    return `${MONTHS[selectedMonth]} ${selectedYear}`;
  }, [timeframe, lang, dayName, selectedDay, selectedMonth, selectedYear, MONTHS]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header & Filters */}
      <div className="glass-card flex-between" style={{ padding: '0.85rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{t('dashboard')}</h2>
          {/* Timeframe Selector Pills */}
          <div style={{ display: 'flex', background: 'var(--bg-tab)', padding: '0.25rem', borderRadius: 'var(--radius-md)', gap: '0.25rem' }}>
            {['daily', 'weekly', 'monthly', 'yearly'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  background: timeframe === tf ? 'var(--bg-panel)' : 'transparent',
                  color: timeframe === tf ? 'var(--accent-brand)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  boxShadow: timeframe === tf ? 'var(--shadow-card)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {t(tf)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>{t('year')}</span>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit' }}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {(timeframe === 'monthly' || timeframe === 'daily' || timeframe === 'weekly') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{t('month')}</span>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit' }}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
          )}
          {(timeframe === 'weekly' || timeframe === 'daily') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{lang === 'en' ? 'Week' : 'Minggu'}</span>
              <select value={Math.ceil(selectedDay / 7)} onChange={e => setSelectedDay((Number(e.target.value) - 1) * 7 + 1)} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit' }}>
                {Array.from({ length: Math.ceil(new Date(selectedYear, selectedMonth + 1, 0).getDate() / 7) }, (_, i) => i + 1).map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          )}
          {timeframe === 'daily' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{t('day')}</span>
              <select value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit' }}>
                {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Hero Metric Cards (Subtle Tinted Color Accent) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {/* Card 1: Total Income */}
        <div className="metric-card" style={{ padding: '1.15rem 1.25rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.03) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <TrendingUp className="metric-card-bg-icon" style={{ color: '#10b981' }} size={48} />
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, zIndex: 1 }}>
            <span>{t('totalIncome')}</span>
            <TrendingUp size={18} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#10b981', zIndex: 1 }}>{formatCurrency(totalIncome)}</div>
        </div>

        {/* Card 2: Total Realisasi (Expense) */}
        <div className="metric-card" style={{ padding: '1.15rem 1.25rem', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.03) 100%)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <TrendingDown className="metric-card-bg-icon" style={{ color: '#ef4444' }} size={48} />
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, zIndex: 1 }}>
            <span>{t('totalRealisasi')}</span>
            <TrendingDown size={18} style={{ color: '#ef4444' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ef4444', zIndex: 1 }}>{formatCurrency(totalRealisasi)}</div>
        </div>

        {/* Card 3: Remaining Balance */}
        <div className="metric-card" style={{ padding: '1.15rem 1.25rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(6, 182, 212, 0.03) 100%)', border: '1px solid rgba(6, 182, 212, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <DollarSign className="metric-card-bg-icon" style={{ color: '#06b6d4' }} size={48} />
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, zIndex: 1 }}>
            <span>{t('saldoSisa')}</span>
            <DollarSign size={18} style={{ color: '#06b6d4' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#06b6d4', zIndex: 1 }}>{formatCurrency(saldo)}</div>
        </div>

        {/* Card 4: Total Allocation */}
        <div className="metric-card" style={{ padding: '1.15rem 1.25rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 100%)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <PieChartIcon className="metric-card-bg-icon" style={{ color: '#f59e0b' }} size={48} />
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, zIndex: 1 }}>
            <span>{t('totalAlokasi')}</span>
            <PieChartIcon size={18} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#f59e0b', zIndex: 1 }}>{formatCurrency(totalAlokasi)}</div>
        </div>

        {/* Card 5: Percentage Allocation */}
        <div className="metric-card" style={{ padding: '1.15rem 1.25rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.03) 100%)', border: '1px solid rgba(168, 85, 247, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <PieChartIcon className="metric-card-bg-icon" style={{ color: '#a855f7' }} size={48} />
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, zIndex: 1 }}>
            <span>{t('percentage')} {t('allocation')}</span>
            <PieChartIcon size={18} style={{ color: '#a855f7' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#a855f7', zIndex: 1 }}>{formatPercent(totalPercent)}</div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Layout (Reference UI Image Match) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: '1.25rem' }}>
        
        {/* LEFT COLUMN: Cashflow Trend & Account Cashflow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Dual Wave Trend Chart */}
          <div className="glass-card" style={{ height: '390px', display: 'flex', flexDirection: 'column', padding: '1.25rem 1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>
                  {t('trendTitle')} ({t(timeframe)})
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.78rem' }}>
                  {dynamicPeriodTextFull}
                </p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineChartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.15} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.15} />
                  </linearGradient>
                  <filter id="shadow" height="150%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.15} vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} 
                  axisLine={{ stroke: 'var(--border-color)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 500 }} 
                  tickFormatter={formatMonetaYAxis} 
                  axisLine={false} 
                  tickLine={false}
                />
                <ReferenceLine y={0} stroke="var(--border-color)" strokeDasharray="3 3" />
                <RechartsTooltip content={<CustomMonetaTooltip />} />
                
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name={t('income')}
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#incomeGradient)" 
                  dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#10b981', stroke: '#ffffff', strokeWidth: 3 }} 
                  style={{ filter: 'url(#shadow)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenseInverted" 
                  name={t('expense')}
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#expenseGradient)" 
                  dot={{ r: 5, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 3 }} 
                  style={{ filter: 'url(#shadow)' }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.4rem', fontSize: '0.82rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#10b981' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                {t('income')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ef4444' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                {t('expense')}
              </div>
            </div>
          </div>

          {/* Real-time Wallet & Cash Balances Card */}
          <div className="glass-card animate-fade-in" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wallet size={18} style={{ color: 'var(--accent-brand)' }} />
                  {t('walletBalances')}
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.78rem' }}>
                  {t('walletBalancesDesc')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Saldo</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', fontFamily: 'Outfit, sans-serif' }}>{formatCurrency(totalLiquidCash)}</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  {walletBalances.length} Wallet
                </span>
                <button 
                  onClick={() => setShowAddWalletModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, background: 'var(--accent-brand)', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: '20px', border: 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}
                >
                  <Plus size={14} strokeWidth={3} /> {lang === 'en' ? 'Add Wallet' : 'Tambah'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.85rem' }}>
              {walletBalances.map(item => (
                <div 
                  key={item.name} 
                  style={{ 
                    background: 'var(--bg-input)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px', 
                    padding: '0.85rem 1rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.4rem', 
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex-between">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                      <AccountLogo name={item.name} size={18} showLabel={false} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
                      <button 
                        onClick={() => { 
                          setEditingWallet(item.name); 
                          const rawVal = item.initial ? item.initial.toString() : '';
                          setWalletInitialInput(rawVal ? Number(rawVal).toLocaleString('id-ID') : ''); 
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '3px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                        title={lang === 'en' ? 'Edit Balance' : 'Ubah Saldo'}
                      >
                        <Pencil size={13} />
                      </button>
                      <button 
                        onClick={() => {
                          showConfirm({
                            title: lang === 'en' ? 'Remove Wallet from Dashboard' : 'Hapus Dompet dari Dashboard',
                            message: lang === 'en' ? `Are you sure you want to remove wallet "${item.name}" from the dashboard? (It will not be deleted from Settings)` : `Apakah Anda yakin ingin menghapus dompet "${item.name}" dari pantauan dashboard? (Tidak akan menghapus dari Pengaturan)`,
                            onConfirm: () => {
                              deleteInitialBalance(item.name);
                              showToast(lang === 'en' ? `Wallet "${item.name}" removed from dashboard` : `Dompet "${item.name}" berhasil dihapus dari pantauan`, 'success');
                            }
                          });
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)', padding: '3px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
                        title={lang === 'en' ? 'Remove from Dashboard' : 'Hapus dari Dashboard'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.current >= 0 ? '#10b981' : '#ef4444', fontFamily: 'Outfit, sans-serif', marginTop: '0.2rem' }}>
                    {formatCurrency(item.current)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Portfolio & Instruments Section (Integrated inside Left Column matching Wallet Grid width) */}
          <div className="glass-card animate-fade-in" style={{ padding: '1.25rem 1.5rem', marginTop: '1.25rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Landmark size={18} style={{ color: '#10b981' }} />
                  {lang === 'en' ? 'Investment Instruments & Assets' : 'Instrumen & Portofolio Investasi'}
                </h3>
                <p className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  {lang === 'en' ? 'Track your active investment accounts, stocks, mutual funds, and assets' : 'Pantau nilai instrumen investasi, saham, sekuritas, & aset Anda'}
                </p>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.25rem 0.65rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                {savingsGoals.length} {lang === 'en' ? 'Instruments' : 'Instrumen'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.85rem' }}>
              {savingsGoals.map(item => {
                const progress = item.target > 0 ? Math.min(100, Math.round((item.current / item.target) * 100)) : 0;
                return (
                  <div key={item.id} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'relative' }}>
                    <div className="flex-between">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
                        <AccountLogo name={item.account || item.name} size={18} showLabel={false} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </span>
                      </div>
                      <button 
                        onClick={() => setDepositGoalId(item.id)}
                        style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.15rem 0.55rem', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}
                      >
                        <Plus size={11} /> {lang === 'en' ? 'Top Up' : 'Setor'}
                      </button>
                    </div>

                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', fontFamily: 'Outfit, sans-serif', marginTop: '0.15rem' }}>
                      {formatCurrency(item.current)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.35rem', marginTop: '0.15rem' }}>
                      <span>Target: {formatCurrency(item.target)}</span>
                      <span style={{ fontWeight: 700 }}>{progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '5px', background: 'var(--bg-panel)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)', borderRadius: '10px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cash Flow by Account Card (Collapsible & Compact) */}
          <div className="glass-card animate-fade-in" style={{ padding: '0.85rem 1.25rem' }}>
            <div 
              className="flex-between" 
              onClick={() => setShowCashFlowByAccount(!showCashFlowByAccount)}
              style={{ cursor: 'pointer', borderBottom: showCashFlowByAccount ? '1px solid var(--border-color)' : 'none', paddingBottom: showCashFlowByAccount ? '0.75rem' : '0' }}
            >
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {t('cashFlowByAccountTitle')}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                    {showCashFlowByAccount ? (lang === 'en' ? 'Click to hide' : 'Klik untuk sembunyikan') : (lang === 'en' ? 'Click to show' : 'Klik untuk tampilkan')}
                  </span>
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-brand)', padding: '0.3rem 0.75rem', borderRadius: '20px' }}>
                  {periodAccountBalances.length} {t('accountsCount')}
                </span>
                <ChevronDown size={18} style={{ transform: showCashFlowByAccount ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            {showCashFlowByAccount && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem', marginTop: '1rem' }}>
                {periodAccountBalances.map(item => (
                  <div key={item.name} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="flex-between">
                      <AccountLogo name={item.name} size={16} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.net >= 0 ? 'var(--accent-income)' : 'var(--accent-expense)' }}>
                        {item.net >= 0 ? '+' : ''}{formatCurrency(item.net)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.4rem' }}>
                      <span>In: <strong className="text-income">+{formatCurrency(item.income)}</strong></span>
                      <span>Out: <strong className="text-expense">-{formatCurrency(item.expense)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN: Budget Allocation & Recent Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Card 1: Budget Allocation */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
              {t('budgetAllocation')} ({dynamicPeriodText})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categoryData.map((row, idx) => {
                const colors = ['#10B981', '#F97316', '#A855F7', '#3B82F6', '#EAB308', '#EC4899'];
                const color = colors[idx % colors.length];
                return (
                  <div key={row.name} style={{ background: 'var(--bg-input)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div className="flex-between" style={{ alignItems: 'flex-start', gap: '0.5rem' }}>
                      
                      {/* Left: Indicator, Title & Desc */}
                      <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '0.25rem' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
                          {row.desc && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.desc}</span>}
                        </div>
                      </div>
                      
                      {/* Right: Amounts */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: row.overbudget ? 'var(--accent-expense)' : 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                          {formatCurrency(row.realisasi)}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          / {formatCurrency(row.alokasi)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar & Status Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-panel)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(row.progress * 100, 100)}%`, height: '100%', background: row.overbudget ? 'var(--accent-expense)' : color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.65rem', fontWeight: 700 }}>
                        {row.overbudget ? (
                          <span style={{ color: 'var(--accent-expense)' }}>
                            Over Budget: {formatCurrency(row.realisasi - row.alokasi)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {lang === 'en' ? 'Remaining: ' : 'Tersisa: '}{formatCurrency(row.alokasi - row.realisasi)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Recent Transactions (Ultra User-Friendly UI) */}
          <div className="glass-card" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t('recentTransactions')}
                </h3>
                <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{dynamicPeriodText}</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'var(--bg-tab)', color: 'var(--text-secondary)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {transactions.filter(tItem => isMatchTimeframe(tItem.date)).length} {lang === 'en' ? 'Transactions' : 'Transaksi'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
              {transactions.filter(tItem => isMatchTimeframe(tItem.date)).length === 0 ? (
                <p className="text-secondary text-center" style={{ padding: '1.5rem', fontSize: '0.82rem' }}>{t('noTransactions')}</p>
              ) : transactions.filter(tItem => isMatchTimeframe(tItem.date)).slice(0, 20).map(tItem => (
                <div 
                  key={tItem.id} 
                  onClick={() => setSelectedDetailTx(tItem)}
                  style={{ 
                    padding: '0.65rem 0.85rem', 
                    background: 'var(--bg-input)', 
                    borderRadius: '10px', 
                    border: '1px solid var(--border-color)', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  {/* Top Row: Category + Badge | Amount + Actions */}
                  <div className="flex-between" style={{ width: '100%', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        background: tItem.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                        color: tItem.type === 'income' ? '#10b981' : '#ef4444', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0 
                      }}>
                        {tItem.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      </div>

                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tItem.category}
                      </span>

                      {tItem.account && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent-brand-light)', background: 'rgba(59, 130, 246, 0.12)', padding: '0.08rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.2)', flexShrink: 0 }}>
                          {tItem.account}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <span className={tItem.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontWeight: 800, fontSize: '0.88rem', fontFamily: 'Outfit, sans-serif' }}>
                        {tItem.type === 'income' ? '+' : '-'}{formatCurrency(tItem.amount)}
                      </span>
                      <div style={{ display: 'flex', gap: '0.15rem', marginLeft: '0.2rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); startEdit(tItem); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title={t('edit')}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteTransaction(tItem.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)', padding: '2px', borderRadius: '4px', display: 'flex', alignItems: 'center' }} title={t('delete')}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Date & Time + Note */}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', paddingLeft: '2.25rem' }}>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {new Date(tItem.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { day: '2-digit', month: 'short' })} • {new Date(tItem.date).toLocaleTimeString(lang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {tItem.note && (
                      <span style={{ color: 'var(--text-primary)', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        • {tItem.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>



      {/* Edit Transaction Modal Pop-Up */}
      {editingTx && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingTx(null)}>
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>{t('editTransaction')}</h2>
              <button onClick={() => setEditingTx(null)} className="btn" style={{ padding: '0.4rem', background: 'none', boxShadow: 'none', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {editError}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} style={{ display: 'grid', gap: '1rem' }} className="grid-cols-2">
              <div className="input-group">
                <label>{t('type')}</label>
                <select className="input-field" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                  <option value="expense">{t('expense')}</option>
                  <option value="income">{t('income')}</option>
                </select>
              </div>
              <div className="input-group">
                <label>{t('amount')}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={editForm.amount} 
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    const formattedValue = rawValue ? Number(rawValue).toLocaleString('en-US') : '';
                    setEditForm({...editForm, amount: formattedValue});
                  }} 
                  required 
                />
              </div>
              <div className="input-group">
                <label>{t('category')}</label>
                <select className="input-field" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} required>
                  <option value="" disabled>{t('selectCategory')}</option>
                  {editForm.type === 'expense' ? (
                    <>
                      {allocations.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                    </>
                  ) : (
                    <>
                      {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </>
                  )}
                </select>
              </div>
              <div className="input-group">
                <label>{t('account')}</label>
                <SearchableAccountSelect 
                  accounts={accounts} 
                  value={editForm.account} 
                  onChange={val => setEditForm({...editForm, account: val})} 
                />
              </div>
              <div className="input-group">
                <label>{t('dateLabel')}</label>
                <input type="datetime-local" className="input-field" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} required />
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>{t('note')}</label>
                <input type="text" className="input-field" value={editForm.note} onChange={e => setEditForm({...editForm, note: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1, border: '1px solid var(--border-color)' }} onClick={() => setEditingTx(null)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {t('updateTransactionBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Starting Balance Modal */}
      {editingWallet && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingWallet(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AccountLogo name={editingWallet} size={20} />
                {t('editStartingBalanceTitle')}: {editingWallet}
              </h3>
              <button onClick={() => setEditingWallet(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveInitialBalance} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>{t('startingBalance')} (Rp)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="250.000" 
                  value={walletInitialInput} 
                  onChange={e => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setWalletInitialInput(clean ? Number(clean).toLocaleString('id-ID') : '');
                  }} 
                  required 
                  autoFocus 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setEditingWallet(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>{t('saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Wallet Modal */}
      {showAddWalletModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddWalletModal(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={20} style={{ color: 'var(--accent-brand)' }} />
                {lang === 'en' ? 'Add New Wallet' : 'Tambah Dompet Baru'}
              </h3>
              <button onClick={() => setShowAddWalletModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            
              <form onSubmit={handleAddNewWallet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>{lang === 'en' ? 'Select Wallet / Bank Source' : 'Pilih Sumber Dompet / Bank'}</label>
                <select 
                  className="input-field" 
                  value={newWalletName} 
                  onChange={e => setNewWalletName(e.target.value)} 
                  required 
                  style={{ background: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                >
                  <option value="" disabled>{lang === 'en' ? '-- Choose from Settings --' : '-- Pilih dari Pengaturan --'}</option>
                  {accounts.filter(acc => !walletBalances.some(w => w.name === acc)).map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  {lang === 'en' ? '*You can add new categories in Settings' : '*Anda bisa menambah kategori baru di menu Pengaturan'}
                </span>
              </div>

              <div className="input-group">
                <label>{t('startingBalance')} (Rp) - {lang === 'en' ? 'Optional' : 'Opsional'}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="0" 
                  value={newWalletInitial} 
                  onChange={e => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setNewWalletInitial(clean ? Number(clean).toLocaleString('id-ID') : '');
                  }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowAddWalletModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>{t('saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Investment Instrument Modal */}
      {showAddInvestmentModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddInvestmentModal(false)}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Landmark size={20} style={{ color: '#10b981' }} />
                {lang === 'en' ? 'Add Investment Instrument' : 'Tambah Instrumen Investasi'}
              </h3>
              <button onClick={() => setShowAddInvestmentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddInvestmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>{lang === 'en' ? 'Instrument / Goal Name' : 'Nama Instrumen / Portofolio'}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder={lang === 'en' ? 'e.g., Stockbit / Emas Antam' : 'Cth: Stockbit / Emas Antam'}
                  value={newInvestment.name} 
                  onChange={e => setNewInvestment({ ...newInvestment, name: e.target.value })} 
                  required 
                  autoFocus 
                />
              </div>

              <div className="input-group">
                <label>{lang === 'en' ? 'Target Value (Rp)' : 'Target Nilai (Rp)'}</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="50,000,000" 
                  value={newInvestment.target} 
                  onChange={e => setNewInvestment({ ...newInvestment, target: e.target.value })} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>{lang === 'en' ? 'Current Balance (Rp)' : 'Saldo Saat Ini (Rp)'}</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="10,000,000" 
                  value={newInvestment.current} 
                  onChange={e => setNewInvestment({ ...newInvestment, current: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setShowAddInvestmentModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>{t('saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Top-up Investment Modal */}
      {depositGoalId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDepositGoalId(null)}>
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={20} style={{ color: '#10b981' }} />
                {lang === 'en' ? 'Top Up Investment' : 'Setor Hasil Investasi'}
              </h3>
              <button onClick={() => setDepositGoalId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label>{lang === 'en' ? 'Deposit Nominal (Rp)' : 'Nominal Setor / Tambahan (Rp)'}</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="1,000,000" 
                  value={depositAmount} 
                  onChange={e => setDepositAmount(e.target.value)} 
                  required 
                  autoFocus 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setDepositGoalId(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#10b981' }}>{t('saveBtn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Transaction Detail Popup Modal */}
      {selectedDetailTx && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedDetailTx(null)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '440px' }}>
            {/* Modal Header */}
            <div className="flex-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: selectedDetailTx.type === 'income' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                  color: selectedDetailTx.type === 'income' ? '#10b981' : '#ef4444', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  {selectedDetailTx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lang === 'en' ? 'Transaction Details' : 'Rincian Transaksi'}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Ref: TX-{selectedDetailTx.id}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedDetailTx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Amount Banner */}
            <div style={{ 
              textAlign: 'center', 
              padding: '1.25rem', 
              background: selectedDetailTx.type === 'income' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
              borderRadius: '14px', 
              border: selectedDetailTx.type === 'income' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
              marginBottom: '1.25rem' 
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedDetailTx.type === 'income' ? (lang === 'en' ? 'Total Income' : 'Total Pemasukan') : (lang === 'en' ? 'Total Expense' : 'Total Pengeluaran')}
              </span>
              <div style={{ 
                fontSize: '1.85rem', 
                fontWeight: 800, 
                fontFamily: 'Outfit, sans-serif', 
                color: selectedDetailTx.type === 'income' ? '#10b981' : '#ef4444',
                marginTop: '0.2rem'
              }}>
                {selectedDetailTx.type === 'income' ? '+' : '-'}{formatCurrency(selectedDetailTx.amount)}
              </div>
            </div>

            {/* Details List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div className="flex-between" style={{ padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span className="text-secondary" style={{ fontSize: '0.82rem', fontWeight: 500 }}>{t('category')}</span>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{selectedDetailTx.category}</span>
              </div>

              <div className="flex-between" style={{ padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span className="text-secondary" style={{ fontSize: '0.82rem', fontWeight: 500 }}>{t('account')} / Wallet</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AccountLogo name={selectedDetailTx.account || selectedDetailTx.category} size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{selectedDetailTx.account || '-'}</span>
                </div>
              </div>

              <div className="flex-between" style={{ padding: '0.55rem 0.75rem', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span className="text-secondary" style={{ fontSize: '0.82rem', fontWeight: 500 }}>{t('dateLabel')}</span>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                  {new Date(selectedDetailTx.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(selectedDetailTx.date).toLocaleTimeString(lang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t('note')}</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: selectedDetailTx.note ? 'var(--text-primary)' : 'var(--text-secondary)', fontStyle: selectedDetailTx.note ? 'normal' : 'italic' }}>
                  {selectedDetailTx.note || (lang === 'en' ? 'No note provided' : 'Tidak ada catatan')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="btn" 
                style={{ flex: 1, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                onClick={() => {
                  deleteTransaction(selectedDetailTx.id);
                  setSelectedDetailTx(null);
                }}
              >
                <Trash2 size={16} /> {t('delete')}
              </button>

              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                onClick={() => {
                  const txToEdit = selectedDetailTx;
                  setSelectedDetailTx(null);
                  startEdit(txToEdit);
                }}
              >
                <Pencil size={16} /> {lang === 'en' ? 'Edit Transaction' : 'Edit Transaksi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
