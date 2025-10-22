import React from 'react';
import PropTypes from 'prop-types';
import styles from './ToggleSwitch.module.css';

export default function ToggleSwitch(
  {
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    id,
    name,
    className = '',
    round = true,        
  },
  ref
) {
  const sliderClasses = `${styles.slider} ${round ? styles.round : ''}`;

  return (
    <label className={`${styles.switch} ${className}`} htmlFor={id}>
      <input
        ref={ref}
        id={id}
        name={name}
        className={styles.input}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={sliderClasses} aria-hidden="true" />
    </label>
  );
};

ToggleSwitch.propTypes = {
  checked: PropTypes.bool,                                  
  onChange: PropTypes.func,                   
  disabled: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  round: PropTypes.bool,
};

ToggleSwitch.defaultProps = {
  checked: undefined,
  defaultChecked: undefined,
  onChange: undefined,
  disabled: false,
  id: undefined,
  name: undefined,
  ariaLabel: undefined,
  className: '',
  round: true,
};

