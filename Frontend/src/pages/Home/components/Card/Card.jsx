
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css';

export default function Card({ title, value, footerText, Icon, variant, footerColor }) {
  const cardClassName = `${styles.card} ${styles[variant]}`;
  const footerClassName = `${styles.footerText} ${styles[footerColor]}`;
  return (
    <div className={cardClassName}>
      <div className={styles.header}>
        {Icon && <Icon className={styles.icon} />} 
        <span className={styles.title}>{title}</span>
      </div>
      
      <div className={styles.body}>
        <div className={styles.value}>{value}</div>
      </div>
      
      <div className={styles.footer}>
        <span className={footerClassName}>{footerText}</span>
      </div>
    </div>
  );
}

Card.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  footerText: PropTypes.string,
  Icon: PropTypes.elementType, 
  variant: PropTypes.oneOf(['income', 'expense', 'savings', 'goals']).isRequired,
  footerColor: PropTypes.oneOf(['green', 'red', 'default']),
};

Card.defaultProps = {
  footerText: '',
  footerColor: 'default',
};