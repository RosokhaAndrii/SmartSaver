import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './AutoRulePopup.module.css';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AutoRulePopup({ open, onClose, onSave, initialRule = null, wallets = [] }) {
  const initial = {
    id: initialRule?.id || '',
    title: initialRule?.title || '',
    percent: initialRule?.percent ?? 10,
    sourceWalletId: initialRule?.sourceWalletId || (wallets[0]?.id || ''),
    targetWalletId: initialRule?.targetWalletId || (wallets[0]?.id || ''),
    isActive: initialRule?.isActive ?? true,
  };

  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const firstRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setError('');
      setTimeout(() => firstRef.current?.focus(), 20);
    }
  }, [open, initialRule]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const pct = Number(form.percent);
    if (!form.title.trim()) { setError('Вкажіть назву правила'); return; }
    if (Number.isNaN(pct) || pct <= 0 || pct > 100) { setError('Вкажіть відсоток 1–100'); return; }
    if (!form.sourceWalletId || !form.targetWalletId) { setError('Оберіть гаманці'); return; }

    const rule = {
      id: form.id || Date.now().toString(),
      title: form.title,
      percent: Math.round(pct * 100) / 100,
      sourceWalletId: form.sourceWalletId,
      targetWalletId: form.targetWalletId,
      isActive: !!form.isActive,
    };

    onSave(rule);
    onClose();
  }

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <h2 className={styles.title}>{form.id ? 'Редагувати правило' : 'Нове правило автозаощадження'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.label}>Назва правила</label>
            <input ref={firstRef} name="title" className={styles.input} value={form.title} onChange={handleChange} placeholder="Наприклад: Заощадження 10%" />
          </div>

          <div className={styles.rowTwo}>
            <div className={styles.col}>
              <label className={styles.label}>Відсоток (%)</label>
              <input name="percent" type="number" min="1" max="100" className={styles.input} value={form.percent} onChange={handleChange} />
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Активне</label>
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className={styles.checkbox} />
            </div>
          </div>

          <div className={styles.rowTwo}>
            <div className={styles.col}>
              <label className={styles.label}>З гаманця (source)</label>
              <select name="sourceWalletId" value={form.sourceWalletId} onChange={handleChange} className={styles.input}>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Куди надходить (target)</label>
              <select name="targetWalletId" value={form.targetWalletId} onChange={handleChange} className={styles.input}>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>Скасувати</button>
            <button type="submit" className={styles.submit}>{form.id ? 'Зберегти' : 'Створити'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

AutoRulePopup.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialRule: PropTypes.object,
  wallets: PropTypes.array,
};

AutoRulePopup.defaultProps = {
  open: false,
  wallets: [],
  initialRule: null,
};
