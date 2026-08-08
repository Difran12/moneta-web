import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const formatShortYAxis = (value) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
  return value;
};

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function YearlyReport() {
  const { transactions, allocations, lang, t, selectedYear, selectedMonth } = useStore();
  const [reportTimeframe, setReportTimeframe] = useState('yearly'); // daily, weekly, monthly, yearly, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ID;
  const DAYS = lang === 'en' ? DAYS_EN : DAYS_ID;

  // Process data based on timeframe
  const reportData = useMemo(() => {
    // 1. Filter transactions based on timeframe
    let filteredTxs = [];
    const now = new Date();
    // Default reference is selectedYear and selectedMonth from store
    const refDate = new Date(selectedYear, selectedMonth, now.getDate());

    if (reportTimeframe === 'yearly') {
      filteredTxs = transactions.filter(tx => new Date(tx.date).getFullYear() === selectedYear);
    } else if (reportTimeframe === 'monthly') {
      filteredTxs = transactions.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      });
    } else if (reportTimeframe === 'weekly') {
      const startOfWeek = new Date(refDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0,0,0,0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);
      filteredTxs = transactions.filter(tx => {
        const d = new Date(tx.date);
        return d >= startOfWeek && d <= endOfWeek;
      });
    } else if (reportTimeframe === 'daily') {
      filteredTxs = transactions.filter(tx => {
        const d = new Date(tx.date);
        return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth && d.getDate() === refDate.getDate();
      });
    } else if (reportTimeframe === 'custom') {
      if (customStart && customEnd) {
        const start = new Date(customStart);
        start.setHours(0,0,0,0);
        const end = new Date(customEnd);
        end.setHours(23,59,59,999);
        filteredTxs = transactions.filter(tx => {
          const d = new Date(tx.date);
          return d >= start && d <= end;
        });
      }
    }

    // 2. Setup Columns for the table and chart
    let cols = [];
    if (reportTimeframe === 'yearly') {
      cols = MONTHS.map((m, i) => ({ id: i, label: m }));
    } else if (reportTimeframe === 'monthly') {
      cols = [
        { id: 1, label: lang === 'en' ? 'Week 1' : 'Minggu 1' },
        { id: 2, label: lang === 'en' ? 'Week 2' : 'Minggu 2' },
        { id: 3, label: lang === 'en' ? 'Week 3' : 'Minggu 3' },
        { id: 4, label: lang === 'en' ? 'Week 4' : 'Minggu 4' },
        { id: 5, label: lang === 'en' ? 'Week 5' : 'Minggu 5' }
      ];
    } else if (reportTimeframe === 'weekly') {
      // Mon to Sun
      const orderedDays = [1, 2, 3, 4, 5, 6, 0];
      cols = orderedDays.map(d => ({ id: d, label: DAYS[d] }));
    } else if (reportTimeframe === 'daily') {
      cols = [{ id: 'today', label: lang === 'en' ? 'Today' : 'Hari Ini' }];
    } else if (reportTimeframe === 'custom') {
      cols = [{ id: 'total', label: 'Total' }];
    }

    // 3. Initialize aggregate structure
    const agg = cols.map(c => ({
      colId: c.id,
      colLabel: c.label,
      income: 0,
      expense: 0,
      incomeCategories: {},
      expenseCategories: {}
    }));

    // 4. Populate aggregate
    filteredTxs.forEach(tx => {
      const d = new Date(tx.date);
      let colIndex = 0;
      
      if (reportTimeframe === 'yearly') {
        colIndex = d.getMonth();
      } else if (reportTimeframe === 'monthly') {
        const date = d.getDate();
        colIndex = Math.min(Math.floor((date - 1) / 7), 4);
      } else if (reportTimeframe === 'weekly') {
        const day = d.getDay(); // 0 is Sun, 1 is Mon
        colIndex = day === 0 ? 6 : day - 1;
      } else {
        colIndex = 0; // daily and custom only have 1 column
      }

      const targetCol = agg[colIndex];
      if (tx.type === 'income') {
        targetCol.income += tx.amount;
        targetCol.incomeCategories[tx.category] = (targetCol.incomeCategories[tx.category] || 0) + tx.amount;
      } else if (tx.type === 'expense') {
        targetCol.expense += tx.amount;
        targetCol.expenseCategories[tx.category] = (targetCol.expenseCategories[tx.category] || 0) + tx.amount;
      }
    });

    // 5. Extract unique categories
    const allIncCats = new Set();
    const allExpCats = new Set(); // To cross-check with allocations
    agg.forEach(a => {
      Object.keys(a.incomeCategories).forEach(c => allIncCats.add(c));
      Object.keys(a.expenseCategories).forEach(c => allExpCats.add(c));
    });

    // 6. Calculate Totals
    const totalIncome = agg.reduce((sum, a) => sum + a.income, 0);
    const totalExpense = agg.reduce((sum, a) => sum + a.expense, 0);
    const netBalance = totalIncome - totalExpense;
    const expenseRatio = totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0;

    // 7. Chart Data
    const chartData = agg.map(a => ({
      name: a.colLabel,
      income: a.income,
      expense: a.expense
    }));

    return {
      cols,
      agg,
      incomeCategories: Array.from(allIncCats),
      expenseCategories: Array.from(allExpCats),
      totalIncome,
      totalExpense,
      netBalance,
      expenseRatio,
      chartData
    };

  }, [transactions, reportTimeframe, selectedYear, selectedMonth, customStart, customEnd, lang, MONTHS, DAYS]);

  const { cols, agg, incomeCategories, totalIncome, totalExpense, netBalance, expenseRatio, chartData } = reportData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.85rem' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: entry.color, marginBottom: '0.2rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
              <span>{entry.name}: {formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
      
      {/* 1. TIMEFRAME SELECTOR */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {lang === 'en' ? 'Financial Reports' : 'Laporan Keuangan'}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map(tf => (
              <button 
                key={tf}
                onClick={() => setReportTimeframe(tf)}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: reportTimeframe === tf ? 600 : 500,
                  borderRadius: '20px',
                  border: 'none',
                  cursor: 'pointer',
                  background: reportTimeframe === tf ? 'var(--bg-gradient-brand)' : 'var(--bg-input)',
                  color: reportTimeframe === tf ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {tf === 'daily' ? (lang === 'en' ? 'Daily' : 'Harian') :
                 tf === 'weekly' ? (lang === 'en' ? 'Weekly' : 'Mingguan') :
                 tf === 'monthly' ? (lang === 'en' ? 'Monthly' : 'Bulanan') :
                 tf === 'yearly' ? (lang === 'en' ? 'Yearly' : 'Tahunan') :
                 (lang === 'en' ? 'Custom' : 'Kustom')}
              </button>
            ))}
          </div>
        </div>

        {reportTimeframe === 'custom' && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-page)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <Calendar size={18} className="text-secondary" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="input-field" style={{ padding: '0.4rem', fontSize: '0.85rem', height: 'auto' }} />
              <span className="text-secondary"> - </span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="input-field" style={{ padding: '0.4rem', fontSize: '0.85rem', height: 'auto' }} />
            </div>
          </div>
        )}
      </div>

      {/* 2. SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={14} color="#10b981" /> {t('totalIncome')}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(totalIncome)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={14} color="#ef4444" /> {t('expense')}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(totalExpense)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Wallet size={14} color="#3b82f6" /> {t('netBalanceCol') || (lang === 'en' ? 'Net Balance' : 'Net Saldo')}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: netBalance >= 0 ? '#10b981' : '#ef4444' }}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PieChart size={14} color="#f59e0b" /> {lang === 'en' ? 'Expense Ratio' : 'Rasio Pengeluaran'}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {expenseRatio}%
          </div>
        </div>
      </div>

      {/* 3. BAR CHART */}
      <div className="glass-card" style={{ padding: '1.5rem', height: '350px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          {lang === 'en' ? 'Income vs Expense' : 'Pemasukan vs Pengeluaran'}
        </h3>
        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatShortYAxis} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} dx={-10} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '0.85rem', paddingTop: '10px' }} />
              <Bar dataKey="income" name={t('income')} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" name={t('expense')} fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. DYNAMIC TABLE */}
      <div className="glass-card animate-fade-in" style={{ padding: '0' }}>
        <div className="table-container">
          <table className="glass-table">
            <thead>
              <tr className="row-header">
                <th className="col-sticky">{t('category')}</th>
                {cols.map(c => <th key={c.id}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {/* INCOME SECTION */}
              <tr className="row-header" style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                <td className="col-sticky" colSpan={cols.length + 1} style={{ color: '#10b981' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <TrendingUp size={16} /> {t('income').toUpperCase()}
                  </div>
                </td>
              </tr>
              {incomeCategories.length === 0 && (
                <tr>
                  <td className="col-sticky">{t('noTransactions')}</td>
                  {cols.map(c => <td key={c.id}>-</td>)}
                </tr>
              )}
              {incomeCategories.map(cat => (
                <tr key={cat}>
                  <td className="col-sticky">
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cat}</span>
                  </td>
                  {cols.map((c, i) => (
                    <td key={c.id}>{agg[i].incomeCategories[cat] ? formatCurrency(agg[i].incomeCategories[cat]) : '-'}</td>
                  ))}
                </tr>
              ))}
              <tr className="row-total">
                <td className="col-sticky">{t('totalIncome')}</td>
                {cols.map((c, i) => (
                  <td key={c.id} style={{ color: '#10b981' }}>{formatCurrency(agg[i].income)}</td>
                ))}
              </tr>

              {/* ALLOCATION / EXPENSE SECTION */}
              <tr className="row-header" style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
                <td className="col-sticky" colSpan={cols.length + 1} style={{ color: '#ef4444' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <TrendingDown size={16} /> {t('allocation').toUpperCase()} & {t('expense').toUpperCase()}
                  </div>
                </td>
              </tr>
              {allocations.map(alloc => (
                <tr key={alloc.name}>
                  <td className="col-sticky">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{alloc.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {t('allocation')}: {alloc.percent}%
                      </span>
                    </div>
                  </td>
                  {cols.map((c, i) => {
                    const real = agg[i].expenseCategories[alloc.name] || 0;
                    return (
                      <td key={c.id}>
                        {real > 0 ? (
                          <span className="text-expense">{formatCurrency(real)}</span>
                        ) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr className="row-total" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <td className="col-sticky">{t('totalExpenseCol') || (lang === 'en' ? 'Total Expense' : 'Total Pengeluaran')}</td>
                {cols.map((c, i) => (
                  <td key={c.id} className="text-expense">
                    {agg[i].expense > 0 ? formatCurrency(agg[i].expense) : '-'}
                  </td>
                ))}
              </tr>

              {/* NET BALANCE */}
              <tr className="row-total" style={{ background: 'rgba(59, 130, 246, 0.08)' }}>
                <td className="col-sticky">{t('netBalanceCol') || (lang === 'en' ? 'Net Balance' : 'Net Saldo')}</td>
                {cols.map((c, i) => {
                  const diff = agg[i].income - agg[i].expense;
                  let colorClass = "";
                  if (diff > 0) colorClass = "text-income";
                  else if (diff < 0) colorClass = "text-expense";
                  return (
                    <td key={c.id} className={colorClass}>
                      {agg[i].income === 0 && agg[i].expense === 0 ? '-' : formatCurrency(diff)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
