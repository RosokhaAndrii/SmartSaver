import React from "react";
import WalletsPiChart from "./components/WalletsPiChart/WalletsPiChart";
import WalletCategory from "./components/WalletCategory/WalletCategory";
import WalletItem from "./components/WalletItem/WalletItem";
import AddWallet from "./components/AddWallet/AddWallet";
import WalletPopup from "./components/WalletPopup/WalletPopup";
import styles from "./Wallets.module.css";
import usePageTitle from "../../hooks/usePageTitle/usePageTitle";
import { useAuth } from "../../hooks/useAuth/useAuth";

const walletTypes = [
  { id: "bank", label: "Банківський рахунок" },
  { id: "cash", label: "Готівка" },
  { id: "credit", label: "Кредитний рахунок" },
  { id: "invest", label: "Інвестиція" },
  { id: "electroWallet", label: "Електронний гаманець" },
  { id: "savings", label: "Заощадження" },
  { id: "dabate", label: "Дебетова картка" },
  { id: "other", label: "Інший" },
];

export default function Wallets() {
  usePageTitle("Гаманці");
  const { authFetch } = useAuth();
  const [wallets, setWallets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await authFetch("http://localhost:8080/api/wallets");
        if (!res.ok) throw new Error("Failed to load wallets");
        const data = await res.json();
        if (mounted) setWallets(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [authFetch]);

  async function handleCreate(newWallet) {
    try {
      const res = await authFetch("http://localhost:8080/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newWallet.title,
          balance: newWallet.amount,
          currency: "USD",
          type: newWallet.type,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await res.json();
      setWallets((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdate(updated) {
    try {
      const res = await authFetch(
        `http://localhost:8080/api/wallets/${updated.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updated.title,
            balance: updated.amount,
            type: updated.type,
          }),
        },
      );
      if (!res.ok) throw new Error("Update failed");
      const wallet = await res.json();
      setWallets((prev) => prev.map((w) => (w.id === wallet.id ? wallet : w)));
    } catch (err) {
      console.error(err);
    }
  }


  async function handleDelete(id) {
    try {
      const res = await authFetch(`http://localhost:8080/api/wallets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setWallets((prev) => prev.filter((w) => w.id !== id));
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert("Помилка видалення гаманця.");
    }
  }


  async function handleToggleHidden(id, newHidden) {
    try {
      const res = await authFetch(`http://localhost:8080/api/wallets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: newHidden }),
      });
      if (!res.ok) throw new Error("Update failed");
      const wallet = await res.json();
      setWallets((prev) => prev.map((w) => (w.id === wallet.id ? wallet : w)));
    } catch (err) {
      console.error(err);
    }
  }

  function openEdit(id) {
    const w = wallets.find((x) => x.id === id);
    if (!w) return;
    setEditing({
      id: w.id,
      title: w.name,
      amount: w.balance,
      type: w.type,
    });
    setModalOpen(true);
  }

  const groups = React.useMemo(() => {
    const map = new Map();
    for (const w of wallets) {
      const t = w.type || "other";
      if (!map.has(t))
        map.set(t, {
          type: t,
          label: walletTypes.find((x) => x.id === t)?.label || t,
          total: 0,
          items: [],
        });
      const g = map.get(t);
      g.items.push(w);
      g.total += Number(w.balance || 0);
    }
    return Array.from(map.values());
  }, [wallets]);

  const visibleSegments = wallets
    .filter((w) => !w.hidden)
    .map((w) => ({ id: w.id, label: w.name, value: Number(w.balance || 0) }));

  return (
    <>
      <div className={styles.mainContent}>
        <main className={styles.main}>
          <div className={styles.walletsContainer}>
            <WalletsPiChart segments={visibleSegments} />
            <div className={styles.walletList}>
              {groups.map((g) => (
                <div key={g.type} className={styles.categoryGroup}>
                  <WalletCategory
                    categoryLabel={g.label}
                    totalSum={`${g.total}$`}
                  />
                  <div className={styles.walletItems}>
                    {g.items.map((item) => (
                      <WalletItem
                        key={item.id}
                        id={item.id}
                        title={item.name}
                        amount={item.balance}
                        hidden={!!item.hidden}
                        onToggleHidden={handleToggleHidden}
                        onEdit={openEdit}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.addButtonWrap}>
              <AddWallet
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              />
            </div>
          </div>
        </main>
      </div>

      <WalletPopup
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        walletTypes={walletTypes}
        initial={editing}
      />
    </>
  );
}