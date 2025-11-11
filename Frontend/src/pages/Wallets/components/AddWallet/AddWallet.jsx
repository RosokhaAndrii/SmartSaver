import React from 'react'
import AddIcon from '../../../../assets/icons/AddIcon'
import PropTypes from 'prop-types';

import styles from './AddWallet.module.css';

export default function AddWallet({onClick}) {
  return (
    <button className={styles.addButton} onClick={onClick}>
      <span className={styles.icon}><AddIcon></AddIcon></span>
      <p className={styles.title}>Додати гаманець</p>
    </button>
  );
}

AddWallet.propTypes = {
  onClick: PropTypes.func
}

