import React from 'react';
import { Link } from 'react-router';
import styles from './SideBarNav.module.css';

import HomeIcon from '../../assets/icons/HomeIcon.jsx';
import DescriptionIcon from '../../assets/icons/DescriptionIcon.jsx';
import CheckIcon from '../../assets/icons/CheckIcon.jsx';
import DoubleCardIcon from '../../assets/icons/DoubleCardIcon.jsx';
import QuestionIcon from '../../assets/icons/QuestionIcon.jsx';
import SettingsIcon from '../../assets/icons/SettingsIcon.jsx';
import UserProfile from '../UserProfile/UserProfile.jsx';


const items = [
  { path: '/', label: 'Головна', icon: HomeIcon },
  { path: '/transactions', label: 'Транзакції', icon: DescriptionIcon },
  { path: '/wallets', label: 'Гаманці', icon: DoubleCardIcon },
  { path: '/goals', label: 'Цілі', icon: CheckIcon },
];

export default function SideBarNav() {
  return (
     <div className={styles.navBar}>
      <div className={styles.navTop}>
        <UserProfile></UserProfile>
        <nav aria-label="Головна навігація">
          <ul className={styles.navList}>
            {items.map(({ path, label, icon: Icon }) => (
              <li key={path} className={styles.navItem}>
                <Link to={path} className={styles.navLink}>
                  <span className={styles.navIcon} aria-hidden="true">
                    {Icon ? <Icon /> : null}
                  </span>
                  <span className={styles.label}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.navBottom}>
        <nav>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/settings" className={styles.navLink}>
                <span className={styles.navIcon}><SettingsIcon /></span>
                <span className={styles.label}>Налаштування</span>
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/support" className={styles.navLink}>
                <span className={styles.navIcon}><QuestionIcon /></span>
                <span className={styles.label}>Підтримка</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
