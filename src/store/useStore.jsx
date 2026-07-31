import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

// Default mock data if empty
const defaultTransactions = [
  { id: 1, type: 'income', amount: 5000000, category: 'Salary', date: new Date().toISOString(), note: 'Monthly Salary' },
  { id: 2, type: 'expense', amount: 150000, category: 'Food', date: new Date().toISOString(), note: 'Lunch' },
  { id: 3, type: 'expense', amount: 300000, category: 'Transport', date: new Date(Date.now() - 86400000).toISOString(), note: 'Gas' },
];
const defaultAccounts = ['Tunai', 'BCA', 'Mandiri', 'Gopay', 'OVO'];
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

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('money_tracker_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('money_tracker_data', JSON.stringify(transactions));
    localStorage.setItem('money_tracker_accounts', JSON.stringify(accounts));
    localStorage.setItem('money_tracker_income_cat', JSON.stringify(incomeCategories));
    localStorage.setItem('money_tracker_allocations', JSON.stringify(allocations));
    localStorage.setItem('money_tracker_lang', lang);
  }, [transactions, accounts, incomeCategories, allocations, lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['id']?.[key] || key;
  };

  const addTransaction = (transaction) => {
    const newTx = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
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
