import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore.jsx';
import AccountLogo from './AccountLogo';
import SearchableAccountSelect from './SearchableAccountSelect';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Trash2, Pencil, X, AlertCircle } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatPercent = (percent) => {
  return new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(percent);
};

const formatMonetaYAxis = (val) => {
  if (!val || val === 0) return '$0';
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
  const { transactions, allocations, deleteTransaction, updateTransaction, accounts, incomeCategories, lang, t } = useStore();
  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ID;
  
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'

  // Edit Transaction State
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({ type: 'expense', amount: '', category: '', account: '', note: '', date: '' });
  const [editError, setEditError] = useState('');

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
    setEditingTx(null);
    setEditError('');
  };

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    years.add(currentDate.getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentDate]);

  // Helper to filter transaction based on active timeframe
  const isMatchTimeframe = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    
    if (timeframe === 'daily') {
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === now.getDate();
    } else if (timeframe === 'weekly') {
      const diffTime = Math.abs(now - d);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } else if (timeframe === 'monthly') {
      return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
    } else if (timeframe === 'yearly') {
      return d.getFullYear() === selectedYear;
    }
    return true;
  };

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
  }, [transactions, selectedYear, selectedMonth, timeframe, allocations]);

  // Generate chart data dynamically based on timeframe
  const lineChartData = useMemo(() => {
    const data = [];
    
    if (timeframe === 'daily') {
      const days = 7;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
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
    } else if (timeframe === 'weekly') {
      const days = 7;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { weekday: 'short' });
        
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
  }, [transactions, selectedYear, selectedMonth, timeframe, lang, t, MONTHS]);

  const totalAlokasi = totalIncome;
  const saldo = totalIncome - totalRealisasi;
  const totalPercent = totalAlokasi > 0 ? totalRealisasi / totalAlokasi : 0;

  // Compute cash flow breakdown per account & wallet
  const accountBalances = useMemo(() => {
    const map = {};
    accounts.forEach(acc => {
      map[acc] = { income: 0, expense: 0, net: 0 };
    });

    transactions.forEach(tItem => {
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
  }, [accounts, transactions]);

  const totalAssets = accountBalances.reduce((sum, item) => sum + item.net, 0);

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
          {(timeframe === 'monthly' || timeframe === 'daily') && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{t('month')}</span>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit' }}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {/* HERO CARD - Total Assets */}
        <div className="glass-card hero-card" style={{ padding: '1.25rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalAssetsLabel')}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }} className="balance-amount">{formatCurrency(totalAssets)}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalIncome')}</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }} className="text-income">{formatCurrency(totalIncome)}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalRealisasi')}</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }} className="text-expense">{formatCurrency(totalRealisasi)}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalAlokasi')}</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }} className="text-brand">{formatCurrency(totalAlokasi)}</div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('saldoSisa')}</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }} className={saldo >= 0 ? 'text-income' : 'text-expense'}>{formatCurrency(saldo)}</div>
        </div>
      </div>

      {/* Cash Flow by Account & Wallet Card */}
      <div className="glass-card animate-fade-in" style={{ padding: '1.25rem 1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>{t('cashFlowByAccountTitle')}</h3>
            <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Rincian arus kas pemasukan, pengeluaran & net balance per akun/dompet</p>
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-brand)', padding: '0.35rem 0.85rem', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            {accountBalances.length} Akun / Dompet
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {accountBalances.map(item => (
            <div key={item.name} style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', transition: 'all 0.2s' }}>
              <div className="flex-between">
                <AccountLogo name={item.name} size={16} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: item.net >= 0 ? 'var(--accent-income)' : 'var(--accent-expense)' }}>
                  {item.net >= 0 ? '+' : ''}{formatCurrency(item.net)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                <span>In: <strong className="text-income">+{formatCurrency(item.income)}</strong></span>
                <span>Out: <strong className="text-expense">-{formatCurrency(item.expense)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Moneta Dual Cashflow Trend Chart (As in Showcase Image) */}
      <div className="glass-card" style={{ height: '370px', display: 'flex', flexDirection: 'column', padding: '1.25rem 1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: 700 }}>{t('dailyCashflow')}</h3>
            <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{t('income')} & {t('expense')} Trend ({t(timeframe)})</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={lineChartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.25} vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="var(--text-secondary)" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} 
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--text-secondary)" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} 
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
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#incomeGradient)" 
              dot={{ r: 4, fill: '#ffffff', stroke: '#10b981', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#10b981', strokeWidth: 3 }} 
            />
            <Area 
              type="monotone" 
              dataKey="expenseInverted" 
              name={t('expense')}
              stroke="#ef4444" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#expenseGradient)" 
              dot={{ r: 4, fill: '#ffffff', stroke: '#ef4444', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#ef4444', strokeWidth: 3 }} 
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Custom Legend at Bottom Center */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
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

      {/* Table Budget vs Actual */}
      <div className="table-container">
        <table className="glass-table" style={{ width: '100%', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>{t('category')}</th>
              <th style={{ width: '20%', textAlign: 'right' }}>{t('allocation')}</th>
              <th style={{ width: '20%', textAlign: 'right' }}>{t('realization')}</th>
              <th style={{ width: '25%' }}>{t('progress')}</th>
              <th style={{ width: '15%', textAlign: 'right' }}>%</th>
            </tr>
          </thead>
          <tbody>
            {categoryData.map(row => {
              const progPercent = Math.min(row.progress * 100, 100);
              const barColor = row.overbudget ? '#ef4444' : '#f59e0b';
              const isOver = row.overbudget;

              return (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(row.alokasi)}</td>
                  <td style={{ textAlign: 'right', background: isOver ? '#ef4444' : 'transparent', color: isOver ? 'white' : 'inherit', fontWeight: isOver ? 700 : 400 }}>
                    {row.realisasi === 0 ? 'Rp0' : formatCurrency(row.realisasi)}
                  </td>
                  <td>
                    {row.realisasi > 0 && (
                      <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progPercent}%`, background: barColor, height: '100%', transition: 'width 0.5s' }} />
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatPercent(row.progress)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Charts */}
      <div className="grid-cols-2" style={{ gap: '1rem' }}>
        <div className="glass-card" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>{t('chartAllocation')}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="alokasi"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => formatCurrency(value)} />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-card" style={{ height: '280px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>{t('chartRealization')}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} angle={-45} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={(value) => `Rp${value/1000}k`} />
              <RechartsTooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--bg-panel)', borderColor: 'var(--border-color)' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="alokasi" name={t('allocation')} fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realisasi" name={t('realization')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filtered Transaction History */}
      <section className="grid-cols-1" style={{ marginTop: '0.5rem' }}>
        <div className="glass-card animate-fade-in" style={{ overflowY: 'auto', maxHeight: 400 }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{t('transactionHistory')} ({t(timeframe)})</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {transactions.filter(tItem => isMatchTimeframe(tItem.date)).length === 0 ? (
              <p className="text-secondary text-center" style={{ padding: '2rem' }}>{t('noTransactions')}</p>
            ) : transactions.filter(tItem => isMatchTimeframe(tItem.date)).map(tItem => (
              <div key={tItem.id} className="flex-between" style={{ padding: '0.85rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{
                    background: 'var(--bg-tab)',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    minWidth: '80px',
                    fontFamily: 'Outfit, sans-serif',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    lineHeight: '1.25'
                  }}>
                    <span>{new Date(tItem.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { month: 'short', day: '2-digit' })}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '2px', color: 'var(--accent-brand-light)' }}>
                      {new Date(tItem.date).toLocaleTimeString(lang === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                  <div className={`badge-icon ${tItem.type}`}>
                    {tItem.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <h4 className={tItem.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tItem.category}</h4>
                      {tItem.account && <AccountLogo name={tItem.account} size={12} />}
                    </div>
                    <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{tItem.note || t('noNote')}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={tItem.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                    {tItem.type === 'income' ? '+' : '-'}{formatCurrency(tItem.amount)}
                  </span>
                  <button onClick={() => startEdit(tItem)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-brand)' }} title={t('editTransaction')}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => deleteTransaction(tItem.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)' }} title={t('delete')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </div>
  );
}
