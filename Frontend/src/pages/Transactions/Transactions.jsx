import React from 'react';
import usePageTitle from '../../hooks/usePageTitle/usePageTitle';
import Filter from './components/Filter/Filter';
import Dropbar from './components/DropBar/DropBar';
import TransactionDisplayContainer from './components/TransactionsDisplayContainer/TransactionDisplayContainer';
import AddTransaction from './components/AddTransaction/AddTransaction';
import TransactionPopup from './components/TransactionPopup/TransactionPopup';
import styles from './Transactions.module.css';

const periods = [
  { id: 'month', label: 'Місяць' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'half', label: 'Півріччя' },
  { id: 'year', label: 'Рік' },
];

const categories = [
  { id: 'ent', label: 'Розваги', type: 'expense' },
  { id: 'food', label: 'Продукти', type: 'expense' },
  { id: 'salary', label: 'Зарплата', type: 'income' },
];

const wallets = [
  { id: 'cash', label: 'Готівка' },
  { id: 'card', label: 'Картка Абанк' },
  { id: 'abank', label: 'Картка Монобанк' },
];

function parseDisplayDate(ddmmyyyy) {
  if (!ddmmyyyy) return null;
  const [dd, mm, yyyy] = ddmmyyyy.split('.');
  if (!dd || !mm || !yyyy) return null;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0);
}

export default function Transactions() {
  usePageTitle('Транзакції');

  const [transactions, setTransactions] = React.useState([
    { id: 1, category: 'ent', title: 'Розваги', wallet: 'Готівка', walletId: 'cash', amount: -50, date: '03.09.2025', note: '' , type: 'expense'},
    { id: 2, category: 'salary', title: 'Зарплата', wallet: 'Картка Абанк', walletId: 'card', amount: 1200, date: '01.09.2025', note: 'Зарплата серпень', type: 'income'},
  ]);

  const [periodSelection, setPeriodSelection] = React.useState(null); // object from Dropbar
  const [popupOpen, setPopupOpen] = React.useState(false);

  const [filters, setFilters] = React.useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    notes: '',
    wallet: '',
    type: 'all',
  });

  function handlePeriodChange(obj) {
    // obj: { id, label, start, end, refDate }
    setPeriodSelection(obj);
  }

  function handleAdd(tx) {
    setTransactions(prev => [{ ...tx, id: Date.now() }, ...prev]);
  }

  const visibleTransactions = React.useMemo(() => {
    let list = transactions.slice();

    if (periodSelection) {
      const s = periodSelection.start;
      const e = periodSelection.end;
      list = list.filter(t => {
        const d = parseDisplayDate(t.date);
        if (!d) return false;
        return d >= s && d <= e;
      });
    }

    if (filters.type && filters.type !== 'all') {
      list = list.filter(t => {
        const ttype = t.type || (Number(t.amount) < 0 ? 'expense' : 'income');
        return ttype === filters.type;
      });
    }

    if (filters.category && filters.category.trim() !== '') {
      const q = filters.category.trim().toLowerCase();
      list = list.filter(t => {
        const title = (t.title || '').toString().toLowerCase();
        const catId = (t.category || '').toString().toLowerCase();
        const catLabel = (categories.find(c => c.id === t.category)?.label || '').toLowerCase();
        return title.includes(q) || catId.includes(q) || catLabel.includes(q);
      });
    }

    if (filters.notes && filters.notes.trim() !== '') {
      const q = filters.notes.trim().toLowerCase();
      list = list.filter(t => (t.note || '').toLowerCase().includes(q));
    }

    if (filters.wallet && filters.wallet.trim() !== '') {
      const q = filters.wallet.trim().toLowerCase();
      list = list.filter(t => {
        const wLabel = (t.wallet || '').toLowerCase();
        const wId = (t.walletId || '').toLowerCase();
        return wLabel.includes(q) || wId.includes(q);
      });
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      list = list.filter(t => {
        const d = parseDisplayDate(t.date);
        return d && d >= from;
      });
    }
    if (filters.dateTo) {
      // dateTo включно — встановимо кінець дня
      const to = new Date(filters.dateTo);
      to.setHours(23,59,59,999);
      list = list.filter(t => {
        const d = parseDisplayDate(t.date);
        return d && d <= to;
      });
    }

    return list;
  }, [transactions, periodSelection, filters]);

  const handleToggle = React.useCallback((id) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  }, []);

  const handleMenu = React.useCallback((id) => {
    console.log('menu for', id);
  }, []);

  return (
    <>
      <div className={styles.mainContent}>
        <main className={styles.main}>
          <div className={styles.contentGrid}>
            <aside className={styles.filterColumn}>
              <Filter value={filters} onChange={setFilters} />
            </aside>

            <section className={styles.transactionsColumn}>
              <Dropbar
                items={periods}
                onChange={handlePeriodChange}
                placeholder="Місяць"
                width="520px"
              />

              <TransactionDisplayContainer
                transactions={visibleTransactions}
                onToggle={handleToggle}
                onMenu={handleMenu}
              />

              <div style={{ marginTop: 18 }}>
                <AddTransaction onClick={() => setPopupOpen(true)} />
              </div>
            </section>
          </div>
        </main>
      </div>

      <TransactionPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onAdd={(tx) => { handleAdd(tx); setPopupOpen(false); }}
        categories={categories}
        wallets={wallets}
      />
    </>
  );
}
