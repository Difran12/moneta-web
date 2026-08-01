import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const categoryMigrationMap = {
  'Living': 'Kebutuhan Rumah & Hidup',
  'Saving': 'Tabungan & Investasi',
  'Self Reward': 'Gaya Hidup (Kopi/Rokok)',
  'Rokok / Kopi': 'Gaya Hidup (Kopi/Rokok)',
  'Cicilan/Hutang': 'Cicilan & Utang',
  'Family': 'Kebutuhan Rumah & Hidup',
  'Trading': 'Tabungan & Investasi',
  'Learning': 'Edukasi & Darurat',
  'Tak Terduga': 'Edukasi & Darurat'
};

const defaultTransactions = [
  { id: 101, type: 'income', amount: 25998000, category: 'Investasi', account: 'Stockbit', date: new Date().toISOString(), note: 'Portfolio Stockbit' },
  { id: 102, type: 'income', amount: 1000000, category: 'Investasi', account: 'Ajaib', date: new Date().toISOString(), note: 'Portfolio Ajaib Sekuritas' },
  { id: 103, type: 'income', amount: 8000000, category: 'Gaji Bulanan', account: 'Married', date: new Date().toISOString(), note: 'Tabungan Nikah (Married)' },
  { id: 1, type: 'income', amount: 5000000, category: 'Gaji Bulanan', account: 'Livin', date: new Date().toISOString(), note: 'Salary Livin Mandiri' },
  { id: 2, type: 'expense', amount: 150000, category: 'Kebutuhan Rumah & Hidup', account: 'Livin', date: new Date().toISOString(), note: 'Makan & Belanja' },
];
const defaultAccounts = ['Stockbit', 'Ajaib', 'Married', 'Livin', 'Tunai', 'BCA', 'Mandiri', 'Gopay', 'OVO'];
const defaultIncomeCategories = ['Gaji Bulanan', 'Trading', 'Bonus', 'Investasi', 'Lainnya'];
const defaultAllocations = [
  { id: '1', name: 'Tabungan & Investasi', percent: 50, color: '#3b82f6', desc: 'Saham, Reksa Dana, Deposito, Emas' },
  { id: '2', name: 'Kebutuhan Rumah & Hidup', percent: 15, color: '#f97316', desc: 'Belanja, Makan, Listrik, Air, Internet' },
  { id: '3', name: 'Transportasi', percent: 8, color: '#22c55e', desc: 'Bensin, Tol, Servis, Ojek Online' },
  { id: '4', name: 'Cicilan & Utang', percent: 2, color: '#eab308', desc: 'KPR, Cicilan Kendaraan, Pinjaman' },
  { id: '5', name: 'Gaya Hidup (Kopi/Rokok)', percent: 13, color: '#ef4444', desc: 'Nongkrong, Hobi, Hiburan, Langganan' },
  { id: '6', name: 'Edukasi & Darurat', percent: 12, color: '#8b5cf6', desc: 'Buku, Kursus, Kesehatan, Dana Darurat' },
];

const defaultSavingsGoals = [
  { id: '1', name: 'Stockbit', target: 30000000, current: 25998000, color: '#6366f1' },
  { id: '2', name: 'Ajaib', target: 5000000, current: 1000000, color: '#10b981' },
  { id: '3', name: 'Married', target: 50000000, current: 8000000, color: '#ec4899' },
  { id: '4', name: 'Livin', target: 10000000, current: 4850000, color: '#06b6d4' },
];

const defaultDebts = [
  { id: '1', name: 'Cicilan Laptop / Gadget', total: 12000000, paid: 7200000, dueDate: '25 Setiap Bulan', color: '#ef4444' },
  { id: '2', name: 'KPR / Cicilan Rumah', total: 30000000, paid: 18000000, dueDate: '10 Setiap Bulan', color: '#f59e0b' },
];

const defaultInitialBalances = {
  'Tunai': 500000,
  'Livin': 1000000,
  'BCA': 2500000,
  'Gopay': 350000
};

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('money_tracker_data');
    const rawTx = saved ? JSON.parse(saved) : defaultTransactions;
    return rawTx.map(t => {
      if (t.type === 'expense' && categoryMigrationMap[t.category]) {
        return { ...t, category: categoryMigrationMap[t.category] };
      }
      return t;
    });
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

  const [initialBalances, setInitialBalances] = useState(() => {
    const saved = localStorage.getItem('moneta_initial_balances');
    return saved ? JSON.parse(saved) : defaultInitialBalances;
  });

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('money_tracker_lang') || 'en';
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('moneta_user_profile');
    return saved ? JSON.parse(saved) : { name: 'Alex Thompson', initials: 'AT', email: 'alex.thompson@moneta.app', password: 'password123' };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('moneta_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Portfolio Asset Bertambah', message: 'Setoran Rp 25.998.000 ke Stockbit berhasil tercatat.', time: '10 menit lalu', read: false, type: 'asset' },
      { id: 2, title: 'Peringatan Budget Alokasi', message: 'Realisasi kategori Food telah mencapai 85% dari alokasi.', time: '1 jam lalu', read: false, type: 'alert' },
      { id: 3, title: 'Jatuh Tempo Cicilan', message: 'Cicilan Laptop Rp 480.000 jatuh tempo pada tanggal 25.', time: 'Kemarin', read: false, type: 'debt' },
      { id: 4, title: 'Pembayaran Gaji Masuk', message: 'Pemasukan Gaji Bulanan Rp 8.000.000 via Livin Mandiri.', time: '2 hari lalu', read: true, type: 'income' },
      { id: 5, title: 'Keamanan Akun', message: 'Sesi login berhasil diperbarui dari perangkat Windows.', time: '3 hari lalu', read: true, type: 'security' }
    ];
  });

  // Global Toast State
  const [toast, setToast] = useState(null);

  // Global Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const hideToast = () => setToast(null);

  const showConfirm = ({ title, message, onConfirm, confirmText, cancelText, isDanger = true }) => {
    setConfirmModal({
      title,
      message,
      onConfirm,
      confirmText: confirmText || (lang === 'en' ? 'Yes, Delete' : 'Ya, Hapus'),
      cancelText: cancelText || (lang === 'en' ? 'Cancel' : 'Batal'),
      isDanger
    });
  };

  const hideConfirm = () => setConfirmModal(null);

  useEffect(() => {
    localStorage.setItem('money_tracker_data', JSON.stringify(transactions));
    localStorage.setItem('money_tracker_accounts', JSON.stringify(accounts));
    localStorage.setItem('money_tracker_income_cat', JSON.stringify(incomeCategories));
    localStorage.setItem('money_tracker_allocations', JSON.stringify(allocations));
    localStorage.setItem('moneta_savings_goals', JSON.stringify(savingsGoals));
    localStorage.setItem('moneta_debts', JSON.stringify(debts));
    localStorage.setItem('money_tracker_lang', lang);
    localStorage.setItem('moneta_user_profile', JSON.stringify(userProfile));
    localStorage.setItem('moneta_notifications', JSON.stringify(notifications));
    localStorage.setItem('moneta_initial_balances', JSON.stringify(initialBalances));
  }, [transactions, accounts, incomeCategories, allocations, savingsGoals, debts, lang, userProfile, notifications, initialBalances]);

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

  const updateTransaction = (updatedTx) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? {
      ...updatedTx,
      date: updatedTx.date ? new Date(updatedTx.date).toISOString() : t.date
    } : t));
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

  const updateInitialBalance = (accountName, amount) => {
    setInitialBalances(prev => ({
      ...prev,
      [accountName]: Number(amount || 0)
    }));
  };

  const deleteInitialBalance = (accountName) => {
    setInitialBalances(prev => {
      const copy = { ...prev };
      delete copy[accountName];
      return copy;
    });
  };

  const addDebt = (debt) => {
    setDebts(prev => [...prev, { ...debt, id: Date.now().toString(), paid: Number(debt.paid || 0) }]);
  };

  const addAccount = (accountName) => {
    if (!accountName || accounts.includes(accountName)) return;
    setAccounts(prev => [...prev, accountName]);
  };

  const deleteAccount = (accountName) => {
    setAccounts(prev => prev.filter(a => a !== accountName));
    setInitialBalances(prev => {
      const copy = { ...prev };
      delete copy[accountName];
      return copy;
    });
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

  const updateUserProfile = (newProfile) => {
    const initials = newProfile.name ? newProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AT';
    setUserProfile({ ...newProfile, initials });
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetAllocations = () => {
    setAllocations(defaultAllocations);
  };

  return (
    <StoreContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getBalance,
      getIncome,
      getExpense,
      accounts,
      setAccounts,
      addAccount,
      deleteAccount,
      incomeCategories,
      setIncomeCategories,
      allocations,
      setAllocations,
      resetAllocations,
      savingsGoals,
      addSavingsGoal,
      depositSavingsGoal,
      deleteSavingsGoal,
      debts,
      addDebt,
      payDebt,
      deleteDebt,
      userProfile,
      updateUserProfile,
      notifications,
      setNotifications,
      markAllNotificationsRead,
      initialBalances,
      updateInitialBalance,
      deleteInitialBalance,
      selectedMonth,
      setSelectedMonth,
      selectedYear,
      setSelectedYear,
      isLoggedIn,
      setIsLoggedIn,
      lang,
      setLang,
      t,
      toast,
      showToast,
      hideToast,
      confirmModal,
      showConfirm,
      hideConfirm
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
