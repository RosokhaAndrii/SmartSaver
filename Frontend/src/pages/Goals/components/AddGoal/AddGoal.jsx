import React from 'react';
import AddIcon from '../../../../assets/icons/AddIcon';
import PropTypes from 'prop-types';
import styles from './AddGoal.module.css';

export default function AddGoal({ onClick }) {
  return (
    <button data-cy="add-goal" type="button" className={styles.addButton} onClick={onClick}>
      <span className={styles.icon}><AddIcon /></span>
      <p className={styles.title}>Додати ціль</p>
    </button>
  );
}

AddGoal.propTypes = { onClick: PropTypes.func };
AddGoal.defaultProps = { onClick: () => {} };
