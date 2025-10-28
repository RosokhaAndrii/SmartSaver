import React from 'react';
import styles from './RadioButton.module.css';
import PropTypes from 'prop-types';


export default function RadioButton({ name, value, checked, onChange, label, sub, disabled }) {
  const id = `${name}-${value}`;
  return (
    <label className={styles.radio} htmlFor={id} aria-disabled={disabled ? 'true' : undefined}>
      <input
        id={id}
        className={styles.input}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.custom} aria-hidden="true" />
      <span className={styles.labelText}>
        <span className={styles.main}>{label}</span>
        {sub ? <span className={styles.sub}>{sub}</span> : null}
      </span>
    </label>
  );
}

RadioButton.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  sub: PropTypes.string,
  disabled: PropTypes.bool,
};
RadioButton.defaultProps = {
  name: '',
  value: '',  
  checked: false,
  onChange: undefined,
  label: '',
  sub: null,
  disabled: false,
};
