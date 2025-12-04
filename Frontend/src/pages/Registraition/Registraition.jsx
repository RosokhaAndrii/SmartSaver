import React, { useState } from "react";
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth/useAuth';
import styles from './Registration.module.css';
import FinancialInstituionIcon from '../../assets/icons/FinancialnstituionIcon.jsx';

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/home';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Реєстрація не вдалася');
      }

      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(String(err.message));
    } finally {
      setLoading(false);
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
          <label htmlFor="name" className={styles.Label}>Ім&apos;я</label>
          <input
            id="name"
            type="text"
            className={styles.Input}
            placeholder="Ім'я"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <label htmlFor="email" className={styles.Label}>Уведіть електронну пошту</label>
          <input
            id="email"
            type="email"
            className={styles.Input}
            placeholder="Електронна пошта"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label htmlFor="password" className={styles.Label}>Уведіть пароль</label>
          <input
            id="password"
            type="password"
            className={styles.Input}
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.Button} type="submit" disabled={loading}>
            {loading ? 'Зачекайте...' : 'Зареєструватися'}
          </button>
        </form>
      </div>

      <div className={styles.link}>
        <p>Уже маєте акаунт? <Link to="/auth">Увійдіть!</Link></p>
      </div>
    </div>
  );
}
