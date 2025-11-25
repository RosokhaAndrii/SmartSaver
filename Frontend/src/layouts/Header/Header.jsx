import React from 'react';
import PropTypes from 'prop-types';
import styles from './Header.module.css';

import MenuIcon from '../../assets/icons/MenuIcon.jsx';
import ThreeHorizontalDots from '../../assets/icons/ThreeHorizontalDotsIcon.jsx';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { useNavigate } from 'react-router';

export default function Header({ pageName }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <header className={styles.Header}>
      <button className={styles.menuBtn} type="button">
        <MenuIcon />
      </button>

      <h1 className={styles.headerTitle}>{pageName}</h1>

      <div className={styles.right}>
        <button className={styles.moreBtn} aria-label="Опції" type="button">
          <ThreeHorizontalDots />
        </button>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Вийти
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
