import React, { useEffect, useState } from "react";
import Card from './components/Card/Card';
import SpendingPieChart from "./components/SpendingPieChart/SpendingPieChart";
import BalanceChart from "./components/BalanceChart/BalanceChart";
import MonthNav from "./components/MonthNav/MonthNav";
import styles from './Home.module.css';
import PaymentIcon from '../../assets/icons/PaymentIcon.jsx';
import FinancialInstituionIcon from '../../assets/icons/FinancialnstituionIcon.jsx';
import CardIcon from '../../assets/icons/CardIcon.jsx';
import InformationSignIcon from '../../assets/icons/InformationSignIcon.jsx';
import usePageTitle from "../../hooks/usePageTitle/usePageTitle";
import { useAuth } from "../../hooks/useAuth/useAuth";

export default function Home() {
  usePageTitle('Головна');
  const { authFetch } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [monthYear, setMonthYear] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });

  async function loadDashboard({ month, year } = monthYear) {
    try {
      setLoading(true);
      const res = await authFetch(`http://localhost:8080/api/dashboard?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to load dashboard");
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.error("loadDashboard error:", err);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard(monthYear);
  }, [monthYear]);

  if (loading) {
    return <div className={styles.mainContent}><p>Завантаження...</p></div>;
  }

  const totalIncome = dashboard?.monthly_income ?? 0;
  const totalExpense = dashboard?.monthly_expense ?? 0;
  const savings = dashboard?.total_balance ?? 0;
  const goalsValue = `${dashboard?.goals?.completed ?? 0}/${dashboard?.goals?.total ?? 0}`;

  return (
    <div className={styles.mainContent}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.pageTitle}>Аналітика та грошовий потік</h1>

        <div className={styles.cardsSection}>
          <Card
            title="Місячний дохід"
            value={`${totalIncome}$`}
            footerText={totalIncome ? `За місяць` : ''}
            Icon={PaymentIcon}
            variant="income"
            footerColor="green"
          />

          <Card
            title="Місячні витрати"
            value={`${totalExpense}$`}
            footerText={totalExpense ? `За місяць` : ''}
            Icon={CardIcon}
            variant="expense"
            footerColor="red"
          />

          <Card
            title="Заощадження"
            value={`${savings}$`}
            footerText="Загальний баланс"
            Icon={FinancialInstituionIcon}
            variant="savings"
            footerColor="default"
          />

          <Card
            title="Прогрес цілей"
            value={goalsValue}
            footerText="Цілей досягнуто"
            Icon={InformationSignIcon}
            variant="goals"
            footerColor="green"
          />
        </div>

        <div className={styles.chartsSection}>
          <div className={styles.chartBox}>
            <div className={styles.chartHeader}>
              <MonthNav
                month={monthYear.month}
                year={monthYear.year}
                onChange={({ month, year }) => setMonthYear({ month, year })}
              />
              <p className={styles.Spendings}>Загальні витрати: {totalExpense}$</p>
            </div>
            <SpendingPieChart data={dashboard?.spendings_by_category ?? []} />
          </div>

          <div className={styles.chartBox}>
            <BalanceChart
              currentBalance={savings}
              date={dashboard?.period?.end ?? ''}
              changePercentage={Math.round(((savings - (dashboard?.balance_history?.[0]?.balance || 0)) / (dashboard?.balance_history?.[0]?.balance || 1)) * 100 * 10) / 10 || 0}
              data={dashboard?.balance_history ?? []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
