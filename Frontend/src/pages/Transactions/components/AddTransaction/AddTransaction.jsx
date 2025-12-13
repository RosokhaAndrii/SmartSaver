import React from 'react'
import AddIcon from '../../../../assets/icons/AddIcon'
import PropTypes from 'prop-types';
import styles from './AddTransaction.module.css';

export default function AddTransaction({onClick}) {

  return (
    <button data-cy="add-transaction" onClick={onClick} className={styles.addButton}>
      <span className={styles.icon}><AddIcon></AddIcon></span>
      <p className={styles.title}>Додати транзакцію</p>
    </button>
  );
}

AddTransaction.propTypes = {
  onClick: PropTypes.func
}
AddTransaction.defaultProps = {
  onClick: () => {}
}
