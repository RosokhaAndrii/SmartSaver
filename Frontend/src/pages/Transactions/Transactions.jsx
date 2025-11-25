import React, { useEffect, useMemo, useState, useCallback } from "react";
import usePageTitle from "../../hooks/usePageTitle/usePageTitle";
import Filter from "./components/Filter/Filter";
import Dropbar from "./components/DropBar/Dropbar";
import TransactionDisplayContainer from "./components/TransactionsDisplayContainer/TransactionDisplayContainer";
import AddTransaction from "./components/AddTransaction/AddTransaction";
import TransactionPopup from "./components/TransactionPopup/TransactionPopup";
import styles from "./Transactions.module.css";
import { useAuth } from "../../hooks/useAuth/useAuth";

const periods = [
  { id: "month", label: "Місяць" },
  { id: "quarter", label: "Квартал" },
  { id: "half", label: "Півріччя" },
  { id: "year", label: "Рік" },
];

function formatTxFromAPI(tx) {
  const type =
    tx.category_type || (Number(tx.amount) < 0 ? "expense" : "income");

  return {
    id: tx.id,
    category: tx.category_id || null,
    title: tx.category_name || "Без категорії",
    wallet: tx.wallet_name,
    walletId: tx.wallet_id,
    amount: Number(tx.amount),
    date: tx.date, 
    note: tx.description || "",
    type: type,
  };
}

export default function Transactions() {
  usePageTitle("Транзакції");
  const { authFetch } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [periodSelection, setPeriodSelection] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    dateFrom: "",
    dateTo: "",
    notes: "",
    wallet: "",
    type: "all",
  });

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true); 

        const walletsRes = await authFetch("http://localhost:8080/api/wallets");
        if (!walletsRes.ok) throw new Error("Failed to load wallets");
        const walletsData = await walletsRes.json();
        if (mounted) {
          const formattedWallets = walletsData.map((w) => ({
            id: w.id,
            label: w.name,
            currency: w.currency,
          }));
          setWallets(formattedWallets);
        } 
        const categoriesRes = await authFetch(
          "http://localhost:8080/api/categories",
        );
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          if (mounted) setCategories(categoriesData);
        } else {
          console.error("Could not load categories from backend.");
        } 

        const txRes = await authFetch("http://localhost:8080/api/transactions");
        if (!txRes.ok) throw new Error("Failed to load transactions");
        const txData = await txRes.json();
        if (mounted) {
          setTransactions(txData.map(formatTxFromAPI));
        }
      } catch (err) {
        console.error("Помилка завантаження даних:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [authFetch]);

  async function handleAdd(tx) {
    const categoryId = tx.category ? Number(tx.category) : null;
    const apiTx = {
      wallet_id: Number(tx.walletId),
      category_id: categoryId,
      amount: tx.amount,
      description: tx.note,
      date: tx.date.split(".").reverse().join("-"), 
    };

    try {
      const res = await authFetch("http://localhost:8080/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiTx),
      });

      if (!res.ok) throw new Error("Failed to create transaction");

      const createdTx = await res.json();

      setTransactions((prev) => [formatTxFromAPI(createdTx), ...prev]);
    } catch (err) {
      console.error("Помилка при створенні транзакції:", err);
      alert("Помилка при збереженні транзакції. Спробуйте пізніше.");
    }
  }

  function handlePeriodChange(obj) {
    setPeriodSelection(obj);
  }

  const visibleTransactions = useMemo(() => {
    let list = transactions.slice();

    if (periodSelection && periodSelection.start && periodSelection.end) {
      const periodStartIso = periodSelection.start.toISOString().split("T")[0];
      const periodEndIso = periodSelection.end.toISOString().split("T")[0];

      list = list.filter((t) => {
        const txDateIso = t.date.split(".").reverse().join("-");

        return txDateIso >= periodStartIso && txDateIso <= periodEndIso;
      });
    } 

    if (filters.type && filters.type !== "all") {
      list = list.filter((t) => {
        const ttype = t.type || (Number(t.amount) < 0 ? "expense" : "income");
        return ttype === filters.type;
      });
    } 

    if (filters.category && filters.category.trim() !== "") {
      const q = filters.category.trim().toLowerCase();
      list = list.filter((t) => {
        const title = (t.title || "").toString().toLowerCase();
        const catLabel = (
          categories.find((c) => c.id === t.category)?.name || ""
        ) 
          .toLowerCase();
        return title.includes(q) || catLabel.includes(q);
      });
    }

    if (filters.notes && filters.notes.trim() !== "") {
      const q = filters.notes.trim().toLowerCase();
      list = list.filter((t) => (t.note || "").toLowerCase().includes(q));
    }

    if (filters.wallet && filters.wallet.trim() !== "") {
      const q = filters.wallet.trim().toLowerCase();
      list = list.filter((t) => (t.wallet || "").toLowerCase().includes(q));
    }

    if (filters.dateFrom) {
      const filterDateIso = filters.dateFrom; 

      list = list.filter((t) => {
        const txDateIso = t.date.split(".").reverse().join("-");
        return txDateIso >= filterDateIso;
      });
    }

    if (filters.dateTo) {
      const filterDateIso = filters.dateTo; 

      list = list.filter((t) => {
        const txDateIso = t.date.split(".").reverse().join("-");
        return txDateIso <= filterDateIso;
      });
    }

    return list;
  }, [transactions, periodSelection, filters, categories]); 

  const handleToggle = useCallback((id) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)),
    );
  }, []);

  const handleMenu = useCallback((id) => {
    console.log("menu for", id);
  }, []);

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <main className={styles.main}>
          <p>Завантаження даних...</p>
        </main>
      </div>
    );
  }

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
        onAdd={(tx) => {
          handleAdd(tx);
          setPopupOpen(false);
        }}
        categories={categories}
        wallets={wallets}
      />
    </>
  );
}
