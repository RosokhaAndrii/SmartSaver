import React from 'react'
import styles from "./DropDownContent.module.css"
import PropTypes from 'prop-types'
const DropDownContent = ({children}) => {
  return (
    <div className={styles.dropDownContent}>{children}</div>
  )
}

export default DropDownContent

DropDownContent.propTypes = {
  children: PropTypes.node
}