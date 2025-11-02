import React from 'react';
import PropTypes from 'prop-types';
import styles from './TransactionItem.module.css';
import MoreFlipped from '../../../../assets/icons/More(flipped)';
export default function TransactionItem({
  id,
  checked = false,
  onToggle,
  avatar = null,
  title,
  subtitle,
  amount,
  currency = '$',
  date,
  onMenuClick,
}) {
  const isNegative = Number(amount) < 0;
  const formattedAmount = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return (
    <div className={styles.row} role="listitem" data-id={id}>
      <label className={styles.left}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle && onToggle(id)}
          className={styles.checkbox}
          aria-checked={checked}
        />
      </label>

      <div className={styles.avatar}>
        {avatar ? (
          avatar
        ) : (
          <span className={styles.avatarPlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      </div>

      <div className={styles.meta}>
        <div
          className={`${styles.amount} ${isNegative ? styles.negative : styles.positive}`}
          aria-label={`Amount ${isNegative ? 'negative' : 'positive'}`}
        >
          {isNegative ? '-' : '+'}{currency}{formattedAmount}
        </div>
        <div className={styles.date}>{date}</div>
      </div>

      <button
        type="button"
        className={styles.kebab}
        aria-label="Options"
        onClick={(e) => {
          e.stopPropagation();
          onMenuClick && onMenuClick(id);
        }}
      >
       <span><MoreFlipped></MoreFlipped></span>
      </button>
    </div>
  );
}

TransactionItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  checked: PropTypes.bool,
  onToggle: PropTypes.func,
  avatar: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  amount: PropTypes.number,
  currency: PropTypes.string,
  date: PropTypes.string,
  onMenuClick: PropTypes.func,
};
