import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore.jsx';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatPercent = (percent) => {
  return new Intl.NumberFormat('id-ID', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(percent);
};

const formatYAxis = (val) => {
  if (!val || val === 0) return '0';
  if (Math.abs(val) >= 1000000000) return `Rp${(val / 1000000000).toFixed(1)}B`;
  if (Math.abs(val) >= 1000000) return `Rp${(val / 1000000).toFixed(1)}M`;
  if (Math.abs(val) >= 1000) return `Rp${(val / 1000).toFixed(0)}k`;
  return `Rp${val}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        padding: '0.85rem 1.1rem',
        borderRadius: '14px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        minWidth: '170px'
      }}>
        <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.6rem', color: 'var(--text-secondary)' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.3rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
              {entry.name}
            </span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: entry.color, fontFamily: 'Outfit, sans-serif' }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Dashboard() {
  const { transactions, allocations, deleteTransaction, lang, t } = useStore();
  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ID;
  
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [timeframe, setTimeframe] = useState('monthly'); // 'daily' | 'weekly' | 'monthly' | 'yearly'

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
      // Hours of the day or 7 past days
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
          [t('expense')]: exp,
          [t('income')]: inc
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
          [t('expense')]: exp,
          [t('income')]: inc
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
          [t('expense')]: exp,
          [t('income')]: inc
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
          [t('expense')]: dailyExpenses[i] || 0,
          [t('income')]: dailyIncome[i] || 0
        });
      }
    }
    return data;
  }, [transactions, selectedYear, selectedMonth, timeframe, lang, t, MONTHS]);

  const totalAlokasi = totalIncome;
  const saldo = totalIncome - totalRealisasi;
  const totalPercent = totalAlokasi > 0 ? totalRealisasi / totalAlokasi : 0;

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
        {/* HERO CARD */}
        <div className="glass-card hero-card" style={{ padding: '1.25rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalIncome')}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }} className="balance-amount">{formatCurrency(totalIncome)}</div>
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
        <div className="glass-card" style={{ padding: '1.25rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('percentage')}</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }} className={totalPercent > 1 ? 'text-expense' : 'text-primary'}>{formatPercent(totalPercent)}</div>
        </div>
      </div>

      {/* Premium Area Chart (Cashflow Trend) */}
      <div className="glass-card" style={{ height: '340px', display: 'flex', flexDirection: 'column', padding: '1.25rem 1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>{t('dailyCashflow')}</h3>
            <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{t('income')} vs {t('expense')} ({t(timeframe)})</p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={lineChartData} margin={{ top: 15, right: 25, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.35} vertical={false} />
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
              tickFormatter={formatYAxis} 
              axisLine={false} 
              tickLine={false}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', paddingBottom: '12px' }} 
            />
            <Area 
              type="monotone" 
              dataKey={t('income')} 
              stroke="#10b981" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#incomeGradient)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} 
            />
            <Area 
              type="monotone" 
              dataKey={t('expense')} 
              stroke="#ef4444" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#expenseGradient)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }} 
            />
          </AreaChart>
        </ResponsiveContainer>
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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className={`badge-icon ${tItem.type}`}>
                    {tItem.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <h4 className={tItem.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontSize: '0.95rem', fontWeight: 600 }}>{tItem.category}</h4>
                    <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{tItem.account ? `[${tItem.account}] ` : ''}{tItem.note || t('noNote')}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={tItem.type === 'income' ? 'text-income' : 'text-expense'} style={{ fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
                    {tItem.type === 'income' ? '+' : '-'}{formatCurrency(tItem.amount)}
                  </span>
                  <button onClick={() => deleteTransaction(tItem.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-expense)' }} title={t('delete')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
