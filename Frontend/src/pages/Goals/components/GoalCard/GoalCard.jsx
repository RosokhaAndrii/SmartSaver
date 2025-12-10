import React from "react";
import PropTypes from "prop-types";
import styles from "./GoalCard.module.css";
import CheckIcon from "../../../../assets/icons/CheckIcon";

function formatAmount(n) {
  if (n == null) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n) + "$";
}

function clamp01(v) {
  if (!isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

export default function GoalCard({
  title,
  subtitle,
  current = 0,
  target = 100,
  walletLabel,
  daysLeft,
  onEdit,
  checked,
  className,
  dataCy
}) {
  const percent = target ? (current / target) * 100 : 0;
  const pct = Math.round(percent * 10) / 10;
  const progress = clamp01(current / (target || 1));

  return (
    <article data-cy={dataCy} className={`${styles.card} ${className || ""}`} aria-labelledby={`goal-${title}`}>
      <header className={styles.header}>
        <div>
          <h3 id={`goal-${title}`} data-cy="goal-title" className={styles.title}>{title}</h3>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>

        <div className={styles.rightIcons}>
          {checked && (
            <span className={styles.check} aria-hidden title="Завершено"><CheckIcon /></span>
          )}
        </div>
      </header>

      <div className={styles.progressBlock}>
        <div className={styles.amounts}>
          <span data-cy="goal-current" className={styles.current}>{formatAmount(current)}</span>
          <span data-cy="goal-target" className={styles.target}>{formatAmount(target)}</span>
        </div>

        <div className={styles.progressWrap} aria-hidden>
          <div className={styles.track}>
            <div
              className={styles.filled}
              style={{ width: `${progress * 100}%` }}
              aria-hidden
            />
          </div>
        </div>

        <div className={styles.percent}>
          {pct}% досягнуто
        </div>
      </div>

      <div className={styles.meta}>
        {walletLabel && (
          <div data-cy="goal-wallet" className={styles.metaRow}><span className={styles.metaLabel}>Прив&apos;язано до гаманця:</span> {walletLabel}</div>
        )}
        {typeof daysLeft !== "undefined" && (
          <div className={styles.metaRow}><span className={styles.metaLabel}>Залишилось:</span> {daysLeft}</div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          data-cy="goal-edit"
          type="button"
          className={styles.editBtn}
          onClick={onEdit}
          aria-label={`Редагувати ${title}`}
        >
          Редагувати
        </button>
      </div>
    </article>
  );
}

GoalCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  current: PropTypes.number,
  target: PropTypes.number,
  walletLabel: PropTypes.string,
  daysLeft: PropTypes.string,
  onEdit: PropTypes.func,
  checked: PropTypes.bool,
  className: PropTypes.string,
};

GoalCard.defaultProps = {
  subtitle: "",
  current: 0,
  target: 100,
  walletLabel: "",
  daysLeft: undefined,
  onEdit: undefined,
  checked: false,
  className: "",
};
