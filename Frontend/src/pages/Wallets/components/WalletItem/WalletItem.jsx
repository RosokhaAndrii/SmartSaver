import React from "react";
import PropTypes from "prop-types";
import MoreFlipped from "../../../../assets/icons/More(flipped)";
import styles from "./WalletItem.module.css";

export default function WalletItem({
  id,
  title,
  amount,
  hidden = false,
  onToggleHidden, 
  onEdit,         
}) {
  return (
    <div data-cy="wallet-item" className={styles.row} role="listitem">
      <div className={styles.topRow}>
        <div data-cy="wallet-title" className={styles.title} title={title}>{title}</div>
        <span data-cy="wallet-amount" className={styles.amount}>{amount}$</span>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.left}>
          <button
            data-cy="wallet-toggle"
            type="button"
            className={`${styles.switch} ${hidden ? styles.on : ""}`}
            onClick={() => onToggleHidden && onToggleHidden(id, !hidden)}
            aria-pressed={hidden}
            aria-label={hidden ? "Показати гаманець" : "Приховати гаманець"}
          >
            <span className={styles.thumb} />
          </button>
          <span className={styles.label}>Приховати</span>
        </div>

        <div className={styles.right}>
          <button
            data-cy="wallet-edit"
            type="button"
            className={styles.menu}
            onClick={() => onEdit && onEdit(id)}
            aria-label="Редагувати гаманець"
          >
            <MoreFlipped />
          </button>
        </div>
      </div>
    </div>
  );
}

WalletItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hidden: PropTypes.bool,
  onToggleHidden: PropTypes.func,
  onEdit: PropTypes.func,
};
