import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import styles from './GoalPopup.module.css'; // використовуй стиль який я дав раніше

function todayIso() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

export default function GoalPopup({ open, onClose, onSave, initialGoal = null, categories = [], wallets = [] }) {
  const initial = {
    id: initialGoal?.id,
    title: initialGoal?.title || '',
    subtitle: initialGoal?.subtitle || '',
    target: initialGoal?.target ?? '',
    current: initialGoal?.current ?? 0,
    walletId: initialGoal?.walletId || initialGoal?.walletLabel || '',
    deadline: initialGoal?.deadline || todayIso(),
    note: initialGoal?.note || '',
  };

  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const firstRef = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => (mounted.current = false);
  }, []);

  useEffect(() => {
    if (open) {
      setForm({
        id: initialGoal?.id,
        title: initialGoal?.title || '',
        subtitle: initialGoal?.subtitle || '',
        target: initialGoal?.target ?? '',
        current: initialGoal?.current ?? 0,
        walletId: initialGoal?.walletId || initialGoal?.walletLabel || (wallets[0]?.id || wallets[0]?.label || ''),
        deadline: initialGoal?.deadline || todayIso(),
        note: initialGoal?.note || '',
      });
      setError('');
      setTimeout(() => firstRef.current?.focus(), 20);
    }    
  }, [open, initialGoal]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const t = Number(form.target);
    if (!form.title.trim()) {
      setError('Вкажи назву цілі');
      return;
    }
    if (Number.isNaN(t) || t <= 0) {
      setError('Ціль має мати позитивну суму');
      return;
    }

    const result = {
      id: form.id,
      title: form.title,
      subtitle: form.subtitle,
      target: Math.abs(Number(form.target)),
      current: Number(form.current) || 0,
      walletLabel: wallets.find(w => w.id === form.walletId)?.label || form.walletId || form.walletLabel || '',
      deadline: form.deadline,
      note: form.note,
    };

    onSave(result);
    if (mounted.current) {
      setForm(initial);
      onClose();
    }
  }

  if (!open) return null;
  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose} role="presentation">
      <div className={styles.modal} onMouseDown={(e)=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Додати ціль">
        <header className={styles.header}>
          <h2 className={styles.title}>{form.id ? 'Редагувати ціль' : 'Нова ціль'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрити">✕</button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.label}>Назва</label>
            <input ref={firstRef} name="title" value={form.title} onChange={handleChange} className={styles.input} placeholder="Назва цілі" />
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Підзаголовок (опційно)</label>
            <input name="subtitle" value={form.subtitle} onChange={handleChange} className={styles.input} placeholder="Категорія або опис" />
          </div>

          <div className={styles.rowTwo}>
            <div className={styles.col}>
              <label className={styles.label}>Цільова сума</label>
              <input name="target" value={form.target} onChange={handleChange} className={styles.input} type="number" placeholder="1000" />
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Гаманець</label>
              <select name="walletId" value={form.walletId} onChange={handleChange} className={styles.input}>
                {wallets.map(w => <option key={w.id || w.label} value={w.id || w.label}>{w.label || w.id}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.rowTwo}>
            <div className={styles.col}>
              <label className={styles.label}>Дедлайн</label>
              <input name="deadline" type="date" value={form.deadline} onChange={handleChange} className={styles.input} />
            </div>

            <div className={styles.col}>
              <label className={styles.label}>Поточна сума</label>
              <input name="current" type="number" value={form.current} onChange={handleChange} className={styles.input} />
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Нотатка</label>
            <textarea name="note" value={form.note} onChange={handleChange} className={styles.textarea} placeholder="Додаткові деталі (опційно)" />
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

GoalPopup.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialGoal: PropTypes.object,
  categories: PropTypes.array,
  wallets: PropTypes.array,
};
GoalPopup.defaultProps = {
  open: false,
  categories: [],
  wallets: [],
  initialGoal: null,
};
