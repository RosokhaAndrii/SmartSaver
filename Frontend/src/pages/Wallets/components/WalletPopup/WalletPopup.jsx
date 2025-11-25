import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import styles from "./WalletPopup.module.css";

export default function WalletPopup({
  open,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  walletTypes = [],
  initial = null,
}) {
  const defaultForm = {
    title: "",
    amount: "",
    type: walletTypes[0]?.id || "other",
  };
  const [form, setForm] = useState(defaultForm);
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title,
              amount: String(initial.amount || ""),
              type: initial.type,
            }
          : defaultForm,
      );
      setTimeout(() => firstRef.current?.focus(), 20);
    }
  }, [open, initial]);

  if (!open) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    const wallet = {
      id: initial?.id,
      title: form.title.trim(),
      amount: Number(form.amount || 0),
      type: form.type || walletTypes[0]?.id || "other",
    };

    if (initial && onUpdate) onUpdate(wallet);
    else if (!initial && onCreate) onCreate(wallet);

    onClose();
  }

  function handleDeleteClick(e) {
    e.preventDefault();
    if (initial && onDelete) {
      onDelete(initial.id);
      onClose();
    }
  }

  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.header}>
          <h3 className={styles.h}>
            {initial ? "Редагувати гаманець" : "Додати гаманець"}
          </h3>

          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Закрити"
          >
            ✕
          </button>
        </header>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label}>
            Назва
            <input
              ref={firstRef}
              name="title"
              value={form.title}
              onChange={handleChange}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Початкова сума
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Тип
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={styles.input}
            >
              {walletTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.bottomSection}>
            {initial && (
              <div className={styles.deleteGroup}>
                <button
                  type="button"
                  className={styles.btnDelete}
                  onClick={handleDeleteClick}
                >
                  Видалити
                </button>
                <span className={styles.irreversibleNote}>
                  * Дія незворотня
                </span>
              </div>
            )}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={onClose}
              >
                Скасувати
              </button>
              <button type="submit" className={styles.btnCreate}>
                {initial ? "Зберегти" : "Створити"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

WalletPopup.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  walletTypes: PropTypes.array,
  initial: PropTypes.object,
};
