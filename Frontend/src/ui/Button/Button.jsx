import React from 'react'
import PropTypes from 'prop-types'
import styles from './Button.module.css'

export default function Button({icon, children, onClick,  value, name }){
   return(
    <button
    icon = {icon}
    onClick={onClick}
    type = 'button'
    value = {value}
    name = {name}
    className= {styles.Button}
    >
{icon && <span className={styles.icon} >{icon}</span>}
      {children && <span className={styles.label}>{children}</span>}
    </button>
   )

}

Button.propTypes = {
    icon: PropTypes.node,
    children: PropTypes.node,
    onClick: PropTypes.func,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string
}

Button.defaultProps = {
    icon: null,
    children: null,
    onClick: undefined,
    type: undefined,
    value: undefined,
    name: ''
}
