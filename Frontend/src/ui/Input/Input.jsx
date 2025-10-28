
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

export default function Input({ value, onChange, placeholder = '', id,  ...rest }) {
  return (
    <input
      id={id}
      type="text"
      className={`${styles.input} `}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...rest}
    />
  );
}

Input.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  id: PropTypes.string,
};

Input.defaultProps = {
  value: undefined,
  defaultValue: undefined,
  onChange: undefined,
  placeholder: '',
  id: undefined,
};

