import React from 'react';
import PropTypes from 'prop-types';
import styles from './AutoSavings.module.css';

export default function AutoSavings({
  id,
  title,
  subtitle,
  lines = [],
  isActive = false,
  onToggle,
  onEdit,
  className = '',
}) {
  const labelId = `rule-${id}-label`;

  return (
    <article className={`${styles.card} ${className}`} aria-labelledby={labelId}>
      <header className={styles.header}>
        <h3 id={labelId} className={styles.title}>{title}</h3>

        <div className={styles.headerRight}>
          <span
            className={`${styles.statusPill} ${isActive ? styles.active : styles.inactive}`}
            role="status"
            aria-live="polite"
            aria-checked={isActive}
          >
            {isActive ? 'Активне' : 'Неактивне'}
          </span>
        </div>
      </header>

      {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

      <div className={styles.body}>
        {lines && lines.length > 0 ? (
          lines.map((t, i) => (
            <p key={i} className={styles.line}>{t}</p>
          ))
        ) : (
          <p className={styles.line}>Опис відсутній</p>
        )}
      </div>

      <footer className={styles.footer}>
        <button
          data-cy="rule-toggle"
          type="button"
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-pressed={isActive}
        >
          {isActive ? 'Вимкнути' : 'Увімкнути'}
        </button>

        <div className={styles.actionsRight}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={onEdit}
          >
            Редагувати
          </button>
        </div>
      </footer>
    </article>
  );
}

AutoSavings.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  lines: PropTypes.arrayOf(PropTypes.string),
  isActive: PropTypes.bool,
  onToggle: PropTypes.func,
  onEdit: PropTypes.func,
  className: PropTypes.string,
};

AutoSavings.defaultProps = {
  subtitle: '',
  lines: [],
  isActive: false,
  onToggle: undefined,
  onEdit: undefined,
  className: '',
};
