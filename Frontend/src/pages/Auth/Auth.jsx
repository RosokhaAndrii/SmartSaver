import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { useNavigate, useLocation, Link } from 'react-router';
import styles from './Auth.module.css';
import FinancialInstituionIcon from '../../assets/icons/FinancialnstituionIcon';

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/home';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(String(err.message));
    }
  }

  return (
    <div className={styles.Container}>
      <div className={styles.Logo}>
        <span className={styles.Icon}><FinancialInstituionIcon /></span>
        <h1>SmartSaver</h1>
      </div>

      <div className={styles.authContainer}>
        <form className={styles.Form} onSubmit={handleSubmit}>
          <label htmlFor="email" className={styles.Label}>Електронна пошта</label>
          <input
            id="email"
            type="email"
            className={styles.Input}
            placeholder="Електронна пошта"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label htmlFor="password" className={styles.Label}>Пароль</label>
          <input
            id="password"
            type="password"
            className={styles.Input}
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <div className={styles.error}>{error}</div>}
          <button type='submit' className={styles.Button}>Увійти</button>
        </form>
      </div>

      <div className={styles.link}>
        <p>Немає акаунту? <Link to="/register">Створіть його!</Link></p>
      </div>
    </div>
  );
}
