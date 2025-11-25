import React from "react";
import WalletsPiChart from "./components/WalletsPiChart/WalletsPiChart";
import WalletCategory from "./components/WalletCategory/WalletCategory";
import WalletItem from "./components/WalletItem/WalletItem";
import AddWallet from "./components/AddWallet/AddWallet";
import WalletPopup from "./components/WalletPopup/WalletPopup";
import styles from "./Wallets.module.css";
import usePageTitle from "../../hooks/usePageTitle/usePageTitle";

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

const initialWallets = [
  { id: "1", title: "Абанк", amount: 500, type: "bank", hidden: false },
  { id: "2", title: "Монобанк", amount: 500, type: "bank", hidden: false },
  { id: "3", title: "Готівка", amount: 1500, type: "cash", hidden: false },
  { id: "4", title: "Кредитка", amount: 700, type: "credit", hidden: false },
];

export default function Wallets() {
  usePageTitle('Гаманці')
  const [wallets, setWallets] = React.useState(initialWallets);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);

  function handleCreate(newWallet) {
    setWallets((prev) => [{ ...newWallet, hidden: false }, ...prev]);
  }

  function handleUpdate(updated) {
    setWallets((prev) =>
      prev.map((w) => (w.id === updated.id ? { ...w, ...updated } : w)),
    );
  }

  function handleToggleHidden(id, newHidden) {
    setWallets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, hidden: !!newHidden } : w)),
    );
  }

  function openEdit(id) {
    const w = wallets.find((x) => x.id === id);
    if (!w) return;
    setEditing(w);
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
      g.total += Number(w.amount || 0);
    }
    return Array.from(map.values());
  }, [wallets]);

  const visibleSegments = wallets
    .filter((w) => !w.hidden)
    .map((w) => ({ id: w.id, label: w.title, value: Number(w.amount || 0) }));

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
                        title={item.title}
                        amount={item.amount}
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
        walletTypes={walletTypes}
        initial={editing}
      />
    </>
  );
}
