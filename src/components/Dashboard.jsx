import React, { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store/useStore.jsx';
import AccountLogo from './AccountLogo';
import SearchableAccountSelect from './SearchableAccountSelect';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Trash2, Pencil, X, AlertCircle, Wallet, DollarSign, ChevronDown, PieChart as PieChartIcon } from 'lucide-react';

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
  const { transactions, allocations, deleteTransaction, updateTransaction, accounts, incomeCategories, lang, t, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear } = useStore();
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

  // Compute cash flow breakdown per account & wallet for the selected timeframe
  const accountBalances = useMemo(() => {
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

  const totalAssets = accountBalances.reduce((sum, item) => sum + item.net, 0);

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

      {/* Top 4 Hero Metric Cards (Matching Reference Image UI) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>{t('totalAssetsLabel')}</span>
            <Wallet size={16} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{formatCurrency(totalAssets)}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>{t('totalIncome')}</span>
            <TrendingUp size={16} className="text-income" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{formatCurrency(totalIncome)}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>{t('percentage')} {t('allocation')}</span>
            <PieChartIcon size={16} className="text-brand" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{formatPercent(totalPercent)}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
          <div className="flex-between" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <span>{t('saldoSisa')}</span>
            <DollarSign size={16} className="text-income" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{formatCurrency(saldo)}</div>
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
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <span className="text-income">{t('income')}</span>
                <ChevronDown size={14} />
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

          {/* Cash Flow by Account Card */}
          <div className="glass-card animate-fade-in" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>{t('cashFlowByAccountTitle')}</h3>
                <p className="text-secondary" style={{ fontSize: '0.78rem' }}>
                  {lang === 'en' ? 'Account cash flow breakdown' : 'Arus kas per akun'} ({dynamicPeriodText})
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-brand)', padding: '0.3rem 0.75rem', borderRadius: '20px' }}>
                {accountBalances.length} {t('accountsCount')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              {accountBalances.map(item => (
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
                  <div key={row.name}>
                    <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                        {row.name}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        {formatCurrency(row.realisasi)} / {formatCurrency(row.alokasi)}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(row.progress * 100, 100)}%`, height: '100%', background: color, borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Recent Transactions */}
          <div className="glass-card" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
              {t('recentTransactions')} ({dynamicPeriodText})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {transactions.filter(tItem => isMatchTimeframe(tItem.date)).length === 0 ? (
                <p className="text-secondary text-center" style={{ padding: '1.5rem', fontSize: '0.82rem' }}>{t('noTransactions')}</p>
              ) : transactions.filter(tItem => isMatchTimeframe(tItem.date)).slice(0, 5).map(tItem => (
                <div key={tItem.id} className="flex-between" style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <AccountLogo name={tItem.account || tItem.category} size={16} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{tItem.category}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {new Date(tItem.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={tItem.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>
                      {tItem.type === 'income' ? '+' : '-'}{formatCurrency(tItem.amount)}
                    </span>
                    <button onClick={() => startEdit(tItem)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-brand)', padding: 0 }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteTransaction(tItem.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)', padding: 0 }}>
                      <Trash2 size={14} />
                    </button>
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
    </div>
  );
}
