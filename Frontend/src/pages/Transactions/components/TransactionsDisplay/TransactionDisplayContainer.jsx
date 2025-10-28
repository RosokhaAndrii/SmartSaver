import React from 'react'
import styles from './TransactionDisplayContainer.module.css'
import TransactionItem from '../TransactionItem/TransactionItem'

const sample = [
  { id: 1, title: 'Розваги', subtitle: 'Готівка', amount: -50, date: '03.09.2025' },
  { id: 2, title: 'Зарплата', subtitle: 'Картка', amount: 1200, date: '01.09.2025' },
  {id:3, title:' Стипендія',subtitle:'Абанк',amount:300, date:'06.09.2025'}
];
const TransactionDisplayContainer = () => {
const [checked, setChecked] = React.useState({});
    function toggle(id) {
    setChecked((s) => ({ ...s, [id]: !s[id] }));
  }

  function onMenu(id) {
    console.log('menu for', id);
  }

  return (
    <div className={styles.container}>
        <h1 className={styles.containerTitle}>Операції</h1>
        <div className={styles.transactionsContainer}>
            {sample.map((t) => (
        <TransactionItem
          key={t.id}
          id={t.id}
          checked={!!checked[t.id]}
          onToggle={toggle}
          title={t.title}
          subtitle={t.subtitle}
          amount={t.amount}
          date={t.date}
          onMenuClick={onMenu}
        />
      ))}
        </div>
    </div>
  )
}

export default TransactionDisplayContainer