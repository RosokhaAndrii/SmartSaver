import {React, useState} from "react"
import RadioButton from "../../../../ui/Radio Button/RadioButton";
import styles from "./Filter.module.css"
export default function Filter() {
  const [filters, setFilters] = useState({
    category: '',
    from: '',
    notes: '',
    wallet: '',
    type: 'all'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (e) => {
    setFilters(prev => ({
      ...prev,
      type: e.target.value
    }));
  };

  const handleCancel = () => {
    setFilters({
      category: '',
      from: '',
      notes: '',
      wallet: '',
      type: 'all'
    });
  };

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
            placeholder="Value"
            className={styles.filterInput}
          />
        </label>

        <label className={styles.filterLabel}>
          З/до
          <input 
            type="text" 
            name="from"
            value={filters.from}
            onChange={handleInputChange}
            placeholder="Value"
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
            placeholder="Value"
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
            placeholder="Value"
            className={styles.filterInput}
          />
        </label>
      </div>

      <div className={styles.radioGroup}>
        <div className={styles.radioGroupTitle}>Тип</div>

        <RadioButton
          name="type"
          label="Всі"
          value="all"
          checked={filters.type === 'all'}
          onChange={handleTypeChange}
        />

        <RadioButton
          name="type"
          label="Доходи"
          value="income"
          checked={filters.type === 'income'}
          onChange={handleTypeChange}
        />

        <RadioButton
          name="type"
          label="Витрати"
          value="expense"
          checked={filters.type === 'expense'}
          onChange={handleTypeChange}
        />
      </div>
          <button 
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Скасувати
          </button>
        </section>
      );
    }