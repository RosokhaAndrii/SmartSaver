import React from 'react'
import styles from './WalletCategory.module.css'
import PropTypes from 'prop-types'
const WalletCategory = ({categoryLabel, totalSum}) => {
  return (
    <div className={styles.container}>
        <div className={styles.categoryLabel}> {categoryLabel}</div>
        <div className={styles.totalSum}>{totalSum}</div>
    </div>
  )
}

WalletCategory.propTypes = {
    categoryLabel: PropTypes.node,
    totalSum: PropTypes.node
}


export default WalletCategory