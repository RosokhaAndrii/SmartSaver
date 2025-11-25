import React, { useEffect } from "react";
import RadioButton from "../../../../ui/Radio Button/RadioButton";
import styles from "./Filter.module.css";

export default function Filter({ value = {}, onChange = () => {} }) {
  const defaults = {
    category: "",
    dateFrom: "",
    dateTo: "",
    notes: "",
    wallet: "",
    type: "all",
  };

  const filters = { ...defaults, ...(value || {}) };

  function handleInputChange(e) {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  }

  function handleTypeChange(e) {
    onChange({ ...filters, type: e.target.value });
  }

  function handleReset() {
    onChange(defaults);
  }

  useEffect(() => {
  }, [value]);

  return (
    <section className={styles.filterSection}>
      <h1 className={styles.filterTitle}>Фільтрувати</h1>

      <div className={styles.filterSettings}>
        <label className={styles.filterLabel}>
          Категорія
          <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            placeholder="Категорія або частина"
            className={styles.filterInput}
          />
        </label>

        <label className={styles.filterLabel}>
          Дата (від)
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleInputChange}
            className={styles.filterInput}
          />
        </label>

        <label className={styles.filterLabel}>
          Дата (до)
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleInputChange}
            className={styles.filterInput}
          />
        </label>

        <label className={styles.filterLabel}>
          Нотатки
          <input
            type="text"
            name="notes"
            value={filters.notes}
            onChange={handleInputChange}
            placeholder="Пошук по нотатці"
            className={styles.filterInput}
          />
        </label>

        <label className={styles.filterLabel}>
          Ім&apos;я гаманця
          <input
            type="text"
            name="wallet"
            value={filters.wallet}
            onChange={handleInputChange}
            placeholder="Пошук по гаманцю"
            className={styles.filterInput}
          />
        </label>
      </div>

      <div className={styles.radioGroup}>
        <div className={styles.radioGroupTitle}>Тип</div>

        <RadioButton
          name="filter-type"
          label="Всі"
          value="all"
          checked={filters.type === "all"}
          onChange={handleTypeChange}
        />

        <RadioButton
          name="filter-type"
          label="Доходи"
          value="income"
          checked={filters.type === "income"}
          onChange={handleTypeChange}
        />

        <RadioButton
          name="filter-type"
          label="Витрати"
          value="expense"
          checked={filters.type === "expense"}
          onChange={handleTypeChange}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 12 }}>
        <button className={styles.cancelButton} onClick={handleReset} type="button">
          Скасувати
        </button>
      </div>
    </section>
  );
}
