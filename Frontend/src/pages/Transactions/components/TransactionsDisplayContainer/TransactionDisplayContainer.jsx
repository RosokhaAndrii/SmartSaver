import React from 'react'
import styles from './TransactionDisplayContainer.module.css'
import TransactionItem from '../TransactionItem/TransactionItem'
import PropTypes from 'prop-types'

function formatAmount(n) {
  if (n == null || Number.isNaN(Number(n))) return '-';
  const abs = Math.abs(Number(n));
  const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(abs);
  return (Number(n) < 0 ? '-' : '') + formatted + '$';
}

export default function TransactionDisplayContainer({ transactions = [], onToggle, onMenu, onDeleteSelected }) {
  const count = Array.isArray(transactions) ? transactions.length : 0;
  const total = Array.isArray(transactions)
    ? transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0)
    : 0;

  const selectedIds = (transactions || []).filter(t => t.checked).map(t => t.id);

  function handleDeleteClick() {
    if (!selectedIds.length) return;
    if (onDeleteSelected) onDeleteSelected(selectedIds);
  }

  return (
    <div className={styles.container}>
      <div className={styles.containerTitle}>
        <div className={styles.titleLeft}>
          <h1 className={styles.title}>Транзакції</h1>
          <span className={styles.count} aria-live="polite">{count}</span>
        </div>

        {/* тут — середній блок: кнопка видалення + кількість вибраних */}
        <div className={styles.centerBlock} aria-hidden={false}>
          {selectedIds.length > 0 ? (
            <div className={styles.deleteGroup}>
              <div className={styles.selectedNumber} aria-live="polite">
                {selectedIds.length}
              </div>
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
          ) : null}
        </div>

        <div className={styles.totalBlock} aria-hidden={false}>
          <div className={styles.totalLabel}>Загальна сума:</div>
          <div
            className={`${styles.totalValue} ${
              total < 0 ? styles.negative : styles.positive
            }`}
          >
            {formatAmount(total)}
          </div>
        </div>
      </div>

      <div className={styles.transactionsContainer}>
        {transactions.map((t) => (
          <TransactionItem
            key={t.id}
            id={t.id}
            checked={!!t.checked}
            onToggle={onToggle}
            title={t.title}
            subtitle={t.wallet}
            amount={t.amount}
            date={t.date}
            onMenuClick={onMenu}
          />
        ))}
      </div>
    </div>
  )
}

TransactionDisplayContainer.propTypes = {
  transactions: PropTypes.array,
  onToggle: PropTypes.func,
  onMenu: PropTypes.func,
  onDeleteSelected: PropTypes.func,
};
