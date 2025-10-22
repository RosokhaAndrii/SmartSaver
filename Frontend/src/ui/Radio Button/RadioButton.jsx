import React from 'react';
import PropTypes from 'prop-types';
import styles from './Radio.module.css';


 export default function RadioButton({ name, checked, onChange, label }) {
  const id = `${name}`;
  return (
    <label className={styles.radio} htmlFor={id}>
      <input
        id={id}
        className={styles.input}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.custom} aria-hidden="true" />
      <span className={styles.labelText}>{label}</span>
    </label>
  );
}

RadioButton.propTypes = {
  name: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string
}

RadioButton.defaultProps = {
  name: '',
  checked: false,
  onChange: undefined,
  label: ''
}



