import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./MonthNav.module.css";
import ChevronLeftIcon from "../../../../assets/icons/ChevronLeftIcon.jsx";
import ChevronRightIcon from "../../../../assets/icons/ChevronRightIcon.jsx";

export default function MonthNav({ initialDate = new Date() }) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const getMonthLabel = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const monthNames = [
      "січ",
      "лют",
      "бер",
      "кві",
      "тра",
      "чер",
      "лип",
      "сер",
      "вер",
      "жов",
      "лис",
      "гру",
    ];

    return `${monthNames[month]}. ${String(firstDay.getDate()).padStart(2, "0")}-${monthNames[month]}. ${String(lastDay.getDate()).padStart(2, "0")}`;
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <div className={styles.monthNavigator}>
      <button
        className={styles.navButton}
        onClick={goToPreviousMonth}
        type="button"
      >
        <ChevronLeftIcon />
      </button>

      <span className={styles.monthLabel}>{getMonthLabel(currentDate)}</span>

      <button
        className={styles.navButton}
        onClick={goToNextMonth}
        type="button"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

MonthNav.propTypes = {
  initialDate: PropTypes.instanceOf(Date),
};
