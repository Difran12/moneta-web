import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

// Default mock data if empty
const defaultTransactions = [
  { id: 1, type: 'income', amount: 5000000, category: 'Salary', date: new Date().toISOString(), note: 'Monthly Salary' },
  { id: 2, type: 'expense', amount: 150000, category: 'Food', date: new Date().toISOString(), note: 'Lunch' },
  { id: 3, type: 'expense', amount: 300000, category: 'Transport', date: new Date(Date.now() - 86400000).toISOString(), note: 'Gas' },
];
const defaultAccounts = ['Tunai', 'BCA', 'Mandiri', 'BRI', 'BNI', 'Gopay', 'OVO', 'DANA', 'ShopeePay'];
const defaultIncomeCategories = ['Gaji Bulanan', 'Trading', 'Bonus', 'Investasi', 'Lainnya'];
const defaultAllocations = [
  { id: '1', name: 'Saving', percent: 50, color: '#3b82f6' },
  { id: '2', name: 'Self Reward', percent: 5, color: '#ef4444' },
  { id: '3', name: 'Cicilan/Hutang', percent: 2, color: '#eab308' },
  { id: '4', name: 'Transportasi', percent: 8, color: '#22c55e' },
  { id: '5', name: 'Living', percent: 7, color: '#f97316' },
  { id: '6', name: 'Rokok / Kopi', percent: 8, color: '#06b6d4' },
  { id: '7', name: 'Family', percent: 8, color: '#8b5cf6' },
  { id: '8', name: 'Trading', percent: 5, color: '#ec4899' },
  { id: '9', name: 'Learning', percent: 3, color: '#6366f1' },
  { id: '10', name: 'Tak Terduga', percent: 4, color: '#14b8a6' },
];

const defaultSavingsGoals = [
  { id: '1', name: 'Tabungan Darurat', target: 20000000, current: 8500000, icon: 'Shield', color: '#10b981' },
  { id: '2', name: 'Investasi Saham & Reksadana', target: 50000000, current: 22000000, icon: 'TrendingUp', color: '#6366f1' },
  { id: '3', name: 'Tabungan Liburan', target: 10000000, current: 4000000, icon: 'Plane', color: '#06b6d4' },
];

const defaultDebts = [
  { id: '1', name: 'Cicilan Laptop / Gadget', total: 12000000, paid: 7200000, dueDate: '25 Setiap Bulan', color: '#ef4444' },
  { id: '2', name: 'KPR / Cicilan Rumah', total: 30000000, paid: 18000000, dueDate: '10 Setiap Bulan', color: '#f59e0b' },
];

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('money_tracker_data');
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultTransactions;
  });

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('money_tracker_accounts');
    return saved ? JSON.parse(saved) : defaultAccounts;
  });

  const [incomeCategories, setIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('money_tracker_income_cat');
    return saved ? JSON.parse(saved) : defaultIncomeCategories;
  });

  const [allocations, setAllocations] = useState(() => {
    const saved = localStorage.getItem('money_tracker_allocations');
    return saved ? JSON.parse(saved) : defaultAllocations;
  });

  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem('moneta_savings_goals');
    return saved ? JSON.parse(saved) : defaultSavingsGoals;
  });

  const [debts, setDebts] = useState(() => {
    const saved = localStorage.getItem('moneta_debts');
    return saved ? JSON.parse(saved) : defaultDebts;
  });

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('money_tracker_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('money_tracker_data', JSON.stringify(transactions));
    localStorage.setItem('money_tracker_accounts', JSON.stringify(accounts));
    localStorage.setItem('money_tracker_income_cat', JSON.stringify(incomeCategories));
    localStorage.setItem('money_tracker_allocations', JSON.stringify(allocations));
    localStorage.setItem('moneta_savings_goals', JSON.stringify(savingsGoals));
    localStorage.setItem('moneta_debts', JSON.stringify(debts));
    localStorage.setItem('money_tracker_lang', lang);
  }, [transactions, accounts, incomeCategories, allocations, savingsGoals, debts, lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['id']?.[key] || key;
  };

  const addTransaction = (transaction) => {
    const newTx = {
      ...transaction,
      id: Date.now(),
      date: transaction.date ? new Date(transaction.date).toISOString() : new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addSavingsGoal = (goal) => {
    setSavingsGoals(prev => [...prev, { ...goal, id: Date.now().toString(), current: Number(goal.current || 0) }]);
  };

  const depositSavingsGoal = (id, amount) => {
    setSavingsGoals(prev => prev.map(g => g.id === id ? { ...g, current: g.current + Number(amount) } : g));
  };

  const deleteSavingsGoal = (id) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== id));
  };

  const addDebt = (debt) => {
    setDebts(prev => [...prev, { ...debt, id: Date.now().toString(), paid: Number(debt.paid || 0) }]);
  };

  const payDebt = (id, amount) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, paid: Math.min(d.total, d.paid + Number(amount)) } : d));
  };

  const deleteDebt = (id) => {
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const getBalance = () => {
    return transactions.reduce((acc, curr) => {
      if (curr.type === 'income') return acc + curr.amount;
      return acc - curr.amount;
    }, 0);
  };

  const getIncome = () => {
    return transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getExpense = () => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  };

  return (
    <StoreContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      getBalance,
      getIncome,
      getExpense,
      accounts,
      setAccounts,
      incomeCategories,
      setIncomeCategories,
      allocations,
      setAllocations,
      savingsGoals,
      addSavingsGoal,
      depositSavingsGoal,
      deleteSavingsGoal,
      debts,
      addDebt,
      payDebt,
      deleteDebt,
      lang,
      setLang,
      t
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
