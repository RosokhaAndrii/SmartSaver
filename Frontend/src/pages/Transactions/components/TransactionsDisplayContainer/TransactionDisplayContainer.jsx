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

export default function TransactionDisplayContainer({ transactions = [], onToggle, onMenu }) {
  const count = Array.isArray(transactions) ? transactions.length : 0;
  const total = Array.isArray(transactions)
    ? transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0)
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.containerTitle}>
        <div className={styles.titleLeft}>
          <h1 className={styles.title}>Транзакції</h1>
          <span className={styles.count} aria-live="polite">{count}</span>
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
};
