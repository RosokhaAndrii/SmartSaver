// src/pages/Transactions/Transactions.jsx
import React from 'react';
import Header from '../../layouts/Header/Header';
import SideBarNav from '../../layouts/SideBarNav/SideBarNav';
import Filter from './components/Filter/Filter';
import Dropbar from './components/DropDown/DropDown'; 
import TransactionDisplayContainer from './components/TransactionsDisplay/TransactionDisplayContainer';
import AddTransaction from './components/AddTransaction/AddTransaction';
import styles from './Transactions.module.css';

const periods = [
  { id: 'month', label: 'Місяць' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'half', label: 'Півріччя' },
  { id: 'year', label: 'Рік' },
];

export default function Transactions() {
  const [selectedPeriod, setSelectedPeriod] = React.useState('month');

  return (
<>
 <SideBarNav />
      <div className={styles.mainContent}>
        <Header pageName="Транзакції" />
        <main className={styles.main}>
          <div className={styles.innerContent}>
            <section className={styles.filterSection}>
<Filter></Filter>
            </section>

            <section>

            </section>
          </div>
        </main>
      </div>
    </>
  
  );
}
