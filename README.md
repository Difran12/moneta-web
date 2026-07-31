# 💎 Moneta — Personal Finance & Budget Management Platform

> A modern, high-performance, and visually stunning web application for personal financial tracking, budget allocation, and cashflow analytics built with **React 19**, **Vite**, and **Recharts**.

---

## 🌟 Key Features

- 📊 **Multi-Timeframe Cashflow Analytics**: Filter financial reports seamlessly across **Daily**, **Weekly**, **Monthly**, and **Yearly** periods.
- 📉 **Interactive Data Visualizations**:
  - **Glowing Area Chart**: Smooth Cashflow Trend showing Income vs. Expenses with custom glassmorphism tooltips.
  - **Budget Allocation Pie Chart**: Visual breakdown of income percentage distribution.
  - **Expense Realization Bar Chart**: Side-by-side comparison of planned allocation vs. actual spending.
- ⚖️ **Smart Allocation Engine**: Custom budget allocation system enforcing a strict **100% allocation validation rule** with intuitive `+` and `-` controls.
- 🌐 **Bilingual Support (EN / ID)**: One-click instant switching between English and Indonesian across all UI components.
- 💳 **Account & Category Management**: Dynamic custom accounts (Cash, Bank, E-Wallet) and customizable income categories.
- ⚡ **Real-Time State Synchronization**: Modal-based transaction logger powered by React Context API ensuring instant, zero-reload dashboard updates.
- 🌓 **Glassmorphism UI & Theme Engine**: Dark & Light mode toggle with curated design tokens, dynamic gradients, and smooth micro-animations.
- 💾 **Local Persistence**: Client-side data persistence with `localStorage`.

---

## 📸 Application Showcase & Portfolio UI

| Feature | Description |
| :--- | :--- |
| **Dashboard & Cashflow Analytics** | Real-time summary cards, glowing area cashflow chart, progress bars, and filtered transaction history. |
| **Budget & Category Settings** | Management panel for accounts, income sources, and allocation percentages with 100% total verification. |
| **Yearly Financial Report** | High-level annual overview of total income, real realization, and percentage progress per allocation. |
| **Add Transaction Popup Modal** | Sleek modal overlay for adding income or expense entries with formatted currency input. |

---

## 🛠️ Technology Stack & Tools

- **Core & Runtime**: [React 19](https://react.dev/), JavaScript (ES6+)
- **Build Tool & HMR**: [Vite 8](https://vitejs.dev/)
- **Data Visualization**: [Recharts 3](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling & Design System**: Custom Vanilla CSS (Design Tokens, Glassmorphism, Responsive Grid System)
- **State Management**: React Context API (`StoreProvider`)
- **Linting & Code Quality**: [Oxlint](https://oxc.rs/)

---

## 🏗️ Architecture & Technical Design

The application follows a clean, modular React architecture:

```
src/
├── components/
│   ├── Dashboard.jsx       # Financial analytics, charts, budget realization, history
│   ├── Settings.jsx        # Account, income category, and percentage allocation setup
│   └── YearlyReport.jsx    # Annual financial summary report
├── store/
│   └── useStore.jsx        # Centralized state management using React Context API
├── utils/
│   └── translations.js     # Internationalization (i18n) dictionary (EN / ID)
├── App.jsx                 # Main layout wrapper, header, tabs, and transaction modal
├── index.css               # Design system tokens, glassmorphism utilities, dark/light themes
└── main.jsx                # Application root wrapped with StoreProvider
```

### Data Flow Overview:
1. **State Provider (`StoreProvider`)**: Encapsulates `transactions`, `accounts`, `incomeCategories`, `allocations`, and active `lang`.
2. **Persistence Layer**: Automatic synchronization with `localStorage` on any state update.
3. **Reactive Re-renders**: Any transaction logged in the popup modal immediately propagates throughout `Dashboard`, updating cashflow charts, budget progress, and transaction list in real time.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Difran12/moneta-web.git
   cd moneta-web
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
