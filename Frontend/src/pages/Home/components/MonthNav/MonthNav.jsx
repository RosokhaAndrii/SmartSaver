import React from "react";
import PropTypes from "prop-types";
import styles from "./MonthNav.module.css";
import ChevronLeftIcon from "../../../../assets/icons/ChevronLeftIcon.jsx";
import ChevronRightIcon from "../../../../assets/icons/ChevronRightIcon.jsx";

function monthLabel(date) {
  const monthNames = [
    "січ", "лют", "бер", "кві", "тра", "чер",
    "лип", "сер", "вер", "жов", "лис", "гру"
  ];
  return `${monthNames[date.getMonth()]}. ${date.getFullYear()}`;
}

export default function MonthNav({ month, year, onChange }) {
  const current = new Date(year, month - 1, 1);

  const goTo = (d) => {
    onChange && onChange({ month: d.getMonth() + 1, year: d.getFullYear() });
  };

  const goPrev = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    goTo(d);
  };

  const goNext = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() + 1);
    goTo(d);
  };

  return (
    <div className={styles.monthNavigator}>
      <button className={styles.navButton} data-cy="month-prev" onClick={goPrev} type="button" aria-label="Previous month">
        <ChevronLeftIcon />
      </button>

      <span className={styles.monthLabel}>{monthLabel(current)}</span>

      <button className={styles.navButton} data-cy="month-next" onClick={goNext} type="button" aria-label="Next month">
        <ChevronRightIcon />
      </button>
    </div>
  );
}

MonthNav.propTypes = {
  month: PropTypes.number.isRequired, 
  year: PropTypes.number.isRequired,
  onChange: PropTypes.func, 
};

MonthNav.defaultProps = {
  onChange: null,
};
