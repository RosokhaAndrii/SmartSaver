import React from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css';

export default function Card({ title, value, footerText, Icon, variant, footerColor, dataCy }) {
  const cardClassName = `${styles.card} ${styles[variant]}`;
  const footerClassName = `${styles.footerText} ${styles[footerColor]}`;
  
  return (
    <div className={cardClassName} data-cy={dataCy}>
      <div className={styles.header}>
        {Icon && (
          <span className={styles.iconWrapper}>
            <Icon />
          </span>
        )}
        <span className={styles.title}>{title}</span>
      </div>
      
      <div className={styles.body}>
        <div data-cy={`card-${variant}-value`} className={styles.value}>{value}</div>
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