import React from 'react';
import { useStore } from '../store/useStore.jsx';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0);
};

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function YearlyReport() {
  const { transactions, allocations, lang, t, selectedYear } = useStore();
  const MONTHS = lang === 'en' ? MONTHS_EN : MONTHS_ID;

  // Initialize data structures for 12 months
  const monthlyData = Array.from({ length: 12 }, () => ({
    income: 0,
    expense: 0,
    incomeCategories: {}
  }));

  // Aggregate transactions by month
  transactions.forEach(t => {
    const date = new Date(t.date);
    if (date.getFullYear() !== selectedYear) return;
    const month = date.getMonth();
    
    if (t.type === 'income') {
      monthlyData[month].income += t.amount;
      if (!monthlyData[month].incomeCategories[t.category]) {
        monthlyData[month].incomeCategories[t.category] = 0;
      }
      monthlyData[month].incomeCategories[t.category] += t.amount;
    } else if (t.type === 'expense') {
      monthlyData[month].expense += t.amount;
    }
  });

  // Extract all unique income categories used across the year
  const allIncomeCategories = new Set();
  monthlyData.forEach(data => {
    Object.keys(data.incomeCategories).forEach(cat => allIncomeCategories.add(cat));
  });
  const incomeCategoryList = Array.from(allIncomeCategories);

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '0' }}>
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', background: 'var(--bg-gradient-brand)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
          {t('yearlyReportTitle')} {new Date().getFullYear()}
        </h2>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr className="row-header">
              <th className="col-sticky">{t('category')}</th>
              {MONTHS.map(m => <th key={m}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {/* INCOME SECTION */}
            <tr className="row-header" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <td className="col-sticky" colSpan={13}>{t('income').toUpperCase()}</td>
            </tr>
            {incomeCategoryList.length === 0 && (
              <tr>
                <td className="col-sticky">{t('noTransactions')}</td>
                {MONTHS.map(m => <td key={m}>-</td>)}
              </tr>
            )}
            {incomeCategoryList.map(cat => (
              <tr key={cat}>
                <td className="col-sticky">{cat}</td>
                {MONTHS.map((m, i) => (
                  <td key={m}>{monthlyData[i].incomeCategories[cat] ? formatCurrency(monthlyData[i].incomeCategories[cat]) : '-'}</td>
                ))}
              </tr>
            ))}
            <tr className="row-total">
              <td className="col-sticky">{t('totalIncome')}</td>
              {MONTHS.map((m, i) => (
                <td key={m}>{formatCurrency(monthlyData[i].income)}</td>
              ))}
            </tr>

            {/* ALLOCATION SECTION */}
            <tr className="row-header" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <td className="col-sticky" colSpan={13}>{t('allocation').toUpperCase()} ({allocations.reduce((acc, curr) => acc + curr.percent, 0)}%)</td>
            </tr>
            {allocations.map(alloc => (
              <tr key={alloc.name}>
                <td className="col-sticky">
                  {alloc.name} <span className="text-secondary" style={{ fontSize: '0.8em' }}>({alloc.percent}%)</span>
                </td>
                {MONTHS.map((m, i) => {
                  const allocAmount = (monthlyData[i].income * alloc.percent) / 100;
                  return <td key={m}>{allocAmount > 0 ? formatCurrency(allocAmount) : '-'}</td>;
                })}
              </tr>
            ))}

            {/* CASH FLOW SECTION */}
            <tr className="row-header" style={{ background: 'rgba(244, 63, 94, 0.1)' }}>
              <td className="col-sticky" colSpan={13}>{t('expense').toUpperCase()}</td>
            </tr>
            <tr>
              <td className="col-sticky">{t('totalExpenseCol')}</td>
              {MONTHS.map((m, i) => (
                <td key={m} className={monthlyData[i].expense > 0 ? "text-expense" : ""}>
                  {monthlyData[i].expense > 0 ? formatCurrency(monthlyData[i].expense) : '-'}
                </td>
              ))}
            </tr>
            <tr className="row-total" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <td className="col-sticky">{t('netBalanceCol')}</td>
              {MONTHS.map((m, i) => {
                const diff = monthlyData[i].income - monthlyData[i].expense;
                let colorClass = "";
                if (diff > 0) colorClass = "text-income";
                else if (diff < 0) colorClass = "text-expense";
                return (
                  <td key={m} className={colorClass}>
                    {monthlyData[i].income === 0 && monthlyData[i].expense === 0 ? '-' : formatCurrency(diff)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
