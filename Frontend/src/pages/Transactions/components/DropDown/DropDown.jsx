import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Dropdown.module.css';
import ChevronLeftIcon from '../../../../assets/icons/ChevronLeftIcon';
import ChevronRightIcon from '../../../../assets/icons/ChevronRightIcon';
import ChevronDownIcon from './../../../../assets/icons/ChevronDownIcon';


export default function Dropbar({
  items = [],
  value: controlledValue,
  onChange,
  placeholder = 'Оберіть період',
  width = '520px',
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(controlledValue ?? null);
  const containerRef = useRef(null);
  const toggleRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (controlledValue !== undefined) setValue(controlledValue);
  }, [controlledValue]);

  useEffect(() => {
    function handleDoc(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleDoc);
    return () => document.removeEventListener('mousedown', handleDoc);
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function handleToggle() {
    setOpen((s) => !s);
    if (!open) {
      setTimeout(() => {
        listRef.current?.querySelector('[role="menuitem"]')?.focus();
      }, 0);
    }
  }

  function select(item) {
    if (controlledValue === undefined) setValue(item.id);
    onChange?.(item);
    setOpen(false);
    toggleRef.current?.focus();
  }

  const selected = items.find((i) => i.id === value);

  return (
    <div className={styles.root} style={{ width }} ref={containerRef}>
      <div className={styles.bar}>
        <button
          type="button"
          className={styles.sideBtn}
          aria-label="Попередній"
          onClick={() => {
          }}
        >
          <ChevronLeftIcon></ChevronLeftIcon>
        </button>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setTimeout(() => listRef.current?.querySelector('[role="menuitem"]')?.focus(), 0);
            }
          }}
        >

          <span className={styles.label}>
            {selected ? selected.label : placeholder}
          </span>

          <span className={styles.caret} aria-hidden>
            <ChevronDownIcon></ChevronDownIcon>
          </span>
        </button>

        <button
          type="button"
          className={styles.sideBtn}
          aria-label="Наступний"
          onClick={() => {
          }}
        >
          <ChevronRightIcon></ChevronRightIcon>
        </button>
      </div>

      {open && (
        <div className={styles.menuWrap}>
          <div className={styles.menuArrow} aria-hidden />
          <ul className={styles.menu} role="menu" ref={listRef}>
            {items.map((it, idx) => (
              <li key={it.id} role="none">
                <button
                  role="menuitem"
                  type="button"
                  className={styles.menuItem}
                  onClick={() => select(it)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = Math.min(idx + 1, items.length - 1);
                      listRef.current?.querySelectorAll('[role="menuitem"]')[next]?.focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prev = Math.max(idx - 1, 0);
                      listRef.current?.querySelectorAll('[role="menuitem"]')[prev]?.focus();
                    } else if (e.key === 'Escape') {
                      setOpen(false);
                      toggleRef.current?.focus();
                    } else if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      select(it);
                    }
                  }}
                >
                  {it.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

Dropbar.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired })),
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  width: PropTypes.string,
};
