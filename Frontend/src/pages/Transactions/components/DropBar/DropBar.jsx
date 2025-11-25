import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './DropBar.module.css';
import ChevronLeftIcon from '../../../../assets/icons/ChevronLeftIcon';
import ChevronRightIcon from '../../../../assets/icons/ChevronRightIcon';
import ChevronDownIcon from '../../../../assets/icons/ChevronDownIcon';

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0); }
function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }
function startOfQuarter(d) {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1, 0, 0, 0, 0);
}
function endOfQuarter(d) {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
}
function startOfHalf(d) {
  const isFirst = d.getMonth() < 6;
  return new Date(d.getFullYear(), isFirst ? 0 : 6, 1, 0, 0, 0, 0);
}
function endOfHalf(d) {
  const isFirst = d.getMonth() < 6;
  return new Date(d.getFullYear(), isFirst ? 6 : 12, 0, 23, 59, 59, 999);
}
function startOfYear(d) { return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0); }
function endOfYear(d) { return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999); }

function getPeriodRange(id, refDate) {
  switch (id) {
    case 'month': return { start: startOfMonth(refDate), end: endOfMonth(refDate) };
    case 'quarter': return { start: startOfQuarter(refDate), end: endOfQuarter(refDate) };
    case 'half': return { start: startOfHalf(refDate), end: endOfHalf(refDate) };
    case 'year': return { start: startOfYear(refDate), end: endOfYear(refDate) };
    default: return { start: startOfMonth(refDate), end: endOfMonth(refDate) };
  }
}

function addPeriod(id, refDate, delta) {
  const d = new Date(refDate);
  switch (id) {
    case 'month': d.setMonth(d.getMonth() + delta); return d;
    case 'quarter': d.setMonth(d.getMonth() + delta * 3); return d;
    case 'half': d.setMonth(d.getMonth() + delta * 6); return d;
    case 'year': d.setFullYear(d.getFullYear() + delta); return d;
    default: d.setMonth(d.getMonth() + delta); return d;
  }
}

export default function Dropbar({
  items = [],
  value: controlledValue,
  onChange,
  placeholder = 'Оберіть період',
  width = '520px',
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(controlledValue ?? (items[0]?.id ?? null));
  const [refDate, setRefDate] = useState(new Date());
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

  function emitChange(selectedId, rDate) {
    const item = items.find(i => i.id === selectedId);
    const { start, end } = getPeriodRange(selectedId, rDate);
    setValue(selectedId);
    onChange?.({ id: selectedId, label: item?.label ?? selectedId, start, end, refDate: rDate });
  }

  function handleToggle() {
    setOpen(s => !s);
    if (!open) setTimeout(() => listRef.current?.querySelector('[role="menuitem"]')?.focus(), 0);
  }

  function select(it) {
    const nextRef = new Date();
    setRefDate(nextRef);
    emitChange(it.id, nextRef);
    setOpen(false);
    toggleRef.current?.focus();
  }

  function handlePrev() {
    const nextRef = addPeriod(value, refDate, -1);
    setRefDate(nextRef);
    emitChange(value, nextRef);
  }
  function handleNext() {
    const nextRef = addPeriod(value, refDate, +1);
    setRefDate(nextRef);
    emitChange(value, nextRef);
  }

  const selectedItem = items.find(i => i.id === value);
  const currentRange = selectedItem ? getPeriodRange(value, refDate) : null;

  const rangeLabel = currentRange
    ? `${currentRange.start.toLocaleDateString()} — ${currentRange.end.toLocaleDateString()}`
    : '';

  return (
    <div className={styles.root} style={{ width }} ref={containerRef}>
      <div className={styles.bar}>
        <button type="button" className={styles.sideBtn} aria-label="Попередній" onClick={handlePrev}>
          <ChevronLeftIcon />
        </button>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={handleToggle}
        >
          <span className={styles.label}>
            {selectedItem ? selectedItem.label : placeholder}
            <div style={{ fontSize: 12, opacity: 0.8 }}>{rangeLabel}</div>
          </span>
          <span className={styles.caret} aria-hidden><ChevronDownIcon /></span>
        </button>

        <button type="button" className={styles.sideBtn} aria-label="Наступний" onClick={handleNext}>
          <ChevronRightIcon />
        </button>
      </div>

      {open && (
        <div className={styles.menuWrap}>
          <div className={styles.menuArrow} aria-hidden />
          <ul className={styles.menu} role="menu" ref={listRef}>
            {items.map((it, _) => (
              <li key={it.id} role="none">
                <button
                  role="menuitem"
                  type="button"
                  className={styles.menuItem}
                  onClick={() => select(it)}
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
