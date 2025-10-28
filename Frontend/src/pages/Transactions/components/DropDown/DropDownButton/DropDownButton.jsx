import React from 'react'
import styles from "./DropDownButton.module.css"
import ChevronDownIcon from './../../../../../assets/icons/ChevronDownIcon';
import PropTypes from 'prop-types';
const DropDownButton = ({children}) => {
  return (
    <div className={styles.dropDownButton}>{children}
    <span className={styles.toggleIcon}><ChevronDownIcon/></span>
    </div>
  )
}

DropDownButton.propTypes = {
  children: PropTypes.string
}

export default DropDownButton