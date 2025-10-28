import React from "react";
import SideBarNav from "../../layouts/SideBarNav/SideBarNav";
import Header from "../../layouts/Header/Header";
import Card from './components/Card/Card';
import SpendingPieChart from "./components/SpendingPieChart/SpendingPieChart";
import BalanceChart from "./components/BalanceChart/BalanceChart";
import MonthNav from "./components/MonthNav/MonthNav";
import styles from './Home.module.css';

import PaymentIcon from '../../assets/icons/PaymentIcon.jsx';
import FinancialInstituionIcon from '../../assets/icons/FinancialnstituionIcon.jsx';
import CardIcon from '../../assets/icons/CardIcon.jsx';
import InformationSignIcon from '../../assets/icons/InformationSignIcon.jsx';

export default function Home() {
  return (
    <>
      <SideBarNav />
      <div className={styles.mainContent}>
        <Header pageName="Головна" />
        
        <div className={styles.contentWrapper}>
          <h1 className={styles.pageTitle}>Аналітика та грошовий потік</h1>
          
          <div className={styles.cardsSection}>
            <Card
              title="Місячний дохід"
              value="5400$"
              footerText="+2,3% з минулого місяця"
              Icon={PaymentIcon}
              variant="income"
              footerColor="green"
            />
            
            <Card
              title="Місячні витрати"
              value="3800$"
              footerText="+5,4% з минулого місяця"
              Icon={CardIcon}
              variant="expense"
              footerColor="red"
            />
            
            <Card
              title="Заощадження"
              value="1600$"
              footerText="Заощаджено 29,6%"
              Icon={FinancialInstituionIcon}
              variant="savings"
              footerColor="default"
            />
            
            <Card
              title="Прогрес цілей"
              value="0/3"
              footerText="Цілей досягнуто"
              Icon={InformationSignIcon}
              variant="goals"
              footerColor="green"
            />
          </div>

          <div className={styles.chartsSection}>
            <div className={styles.chartBox}>
              <div className={styles.chartHeader}>
                <MonthNav />
                <p className={styles.Spendings}>Загальні витрати: 3800$</p>
              </div>
              <SpendingPieChart />
            </div>
            
            <div className={styles.chartBox}>
              <BalanceChart 
                currentBalance="7194"
                date="24 вересня 2025"
                changePercentage={15.5}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}