import React, { useEffect, useRef, useState, useId } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import styles from "./TransactionPopup.module.css";
import RadioButton from "../../../../ui/Radio Button/RadioButton";

function todayIsoDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}.${mm}.${yy}`;
}

const createInitialState = (category, walletsList) => ({
  type: "expense",
  amount: "", 
  category: category ? category.id : "",
  wallet: walletsList.length ? walletsList[0].id : "",
  note: "",
  date: todayIsoDate(),
});

export default function TransactionPopup({
  open,
  onClose,
  onAdd,
  categories = [],
  wallets = [],
}) {
  const defaultExpenseCategory = categories.find((c) => c.type === "expense");
  const initialDefaultCategory =
    defaultExpenseCategory || (categories.length ? categories[0] : null);

  const [form, setForm] = useState(
    createInitialState(initialDefaultCategory, wallets),
  );
  const [error, setError] = useState("");
  const mountedRef = useRef(false);
  const firstInputRef = useRef(null);

  const idPrefix = useId();
  const radioGroupName = `tx-type-${idPrefix}`; 

  const visibleCategories = categories.filter(
    (c) => c.type === form.type || c.type === "both",
  );

  useEffect(() => {
    const currentDefaultExpenseCategory = categories.find(
      (c) => c.type === "expense",
    );
    const currentDefaultCategory =
      currentDefaultExpenseCategory ||
      (categories.length ? categories[0] : null);

    if (open) {
      const defaultForm = createInitialState(currentDefaultCategory, wallets);
      const categoryIsVisible = visibleCategories.some(
        (c) => c.id === form.category,
      );

      setForm((prev) => ({
        ...defaultForm,
        category:
          prev.category && !categoryIsVisible && categories.length
            ? defaultForm.category
            : defaultForm.category,
      }));
      setError("");
      setTimeout(() => firstInputRef.current?.focus(), 20);
    }
  }, [open, wallets, categories]); 

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    mountedRef.current = true;
    return () => (mountedRef.current = false);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  } 

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const newVisibleCategories = categories.filter(
      (c) => c.type === newType || c.type === "both",
    ); 
    const newDefaultCategory = newVisibleCategories.length
      ? newVisibleCategories[0].id
      : "";

    setForm((f) => ({
      ...f,
      type: newType,
      category: newDefaultCategory,
    }));
  };

  function handleSubmit(e) {
    e.preventDefault();
    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum) || amountNum === 0) {
      setError("Введіть коректну суму (не 0).");
      return;
    }

    if (!form.category && visibleCategories.length > 0) {
      setError("Виберіть категорію.");
      return;
    }

    const tx = {
      id: Date.now(),
      category: form.category,
      note: form.note,
      amount:
        form.type === "expense" ? -Math.abs(amountNum) : Math.abs(amountNum),
      walletId: form.wallet,
      date: formatDisplayDate(form.date),
      type: form.type,
    };

    onAdd(tx);
    if (mountedRef.current) {
      onClose();
    }
  }

  if (!open) return null;
  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose} role="presentation">
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Додати транзакцію"
      >
        <header className={styles.header}>
          <h2 className={styles.title}>Нова транзакція</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрити"
          >
            ✕
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.row}>
            <legend className={styles.label}>Тип</legend>
            <div className={styles.radioRow}>
              <RadioButton
                name={radioGroupName}
                value="expense"
                checked={form.type === "expense"}
                onChange={handleTypeChange}
                label="Витрата"
              />

              <RadioButton
                name={radioGroupName}
                value="income"
                checked={form.type === "income"}
                onChange={handleTypeChange}
                label="Дохід"
              />
            </div>
          </fieldset>

          <div className={styles.row}>
            <label className={styles.label}>Сума</label>

            <input
              ref={firstInputRef}
              name="amount"
              type="number"
              className={styles.input}
              value={form.amount}
              onChange={handleChange}
              placeholder="100.00"
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Категорія</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={styles.input}
            >
              {/* ДОДАЄМО ВИДИМУ ОПЦІЮ ЗА ЗАМОВЧУВАННЯМ, ЯКЩО ID НЕ ВИЗНАЧЕНИЙ */}
              {!form.category && visibleCategories.length > 0 && (
                <option value="" disabled hidden>
                  Виберіть категорію
                </option>
              )}

              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
              {visibleCategories.length === 0 && (
                <option value="" disabled>
                  Немає категорій
                </option>
              )}
            </select>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Гаманець</label>

            <select
              name="wallet"
              value={form.wallet}
              onChange={handleChange}
              className={styles.input}
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Дата</label>

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Нотатка</label>

            <textarea
              name="note"
              className={styles.textarea}
              value={form.note}
              onChange={handleChange}
              placeholder="Короткий опис..."
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Скасувати
            </button>

            <button type="submit" className={styles.submit}>
              Додати
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

TransactionPopup.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  categories: PropTypes.array,
  wallets: PropTypes.array,
};

TransactionPopup.defaultProps = {
  open: false,
  categories: [],
  wallets: [],
};
