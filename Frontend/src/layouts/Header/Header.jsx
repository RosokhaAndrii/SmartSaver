import React from 'react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';

import MenuIcon from '../../assets/icons/MenuIcon.jsx';
import ThreeHorizontalDots from '../../assets/icons/ThreeHorizontalDotsIcon.jsx';

export default function Header({ pageName }) {
  return (
    <header className={styles.Header}>
      <button className={styles.menuBtn}  type="button">
        <MenuIcon />
      </button>
      <h1 className={styles.headerTitle}>{pageName}</h1>

      <div className={styles.right}>
        <button className={styles.moreBtn} aria-label="Опції" type="button">
          <ThreeHorizontalDots />
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  pageName: PropTypes.string,
};

Header.defaultProps = {
  pageName: '',
};
