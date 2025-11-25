import React from 'react';
import AddIcon from '../../../../assets/icons/AddIcon';
import PropTypes from 'prop-types';
import styles from './AddRule.module.css';

export default function AddRule({ onClick }) {
  return (
    <button type="button" className={styles.addButton} onClick={onClick}>
      <span className={styles.icon}><AddIcon /></span>
      <p className={styles.title}>Додати правило</p>
    </button>
  );
}

AddRule.propTypes = { onClick: PropTypes.func };
AddRule.defaultProps = { onClick: () => {} };
