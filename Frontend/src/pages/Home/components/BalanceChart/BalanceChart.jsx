import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import styles from "./BalanceChart.module.css";
import PropTypes from "prop-types";

export default function BalanceChart({ currentBalance, date, changePercentage, data = [] }) {
  const chartData = (data && data.length) ? data.map(d => ({
    date: d.date.slice(8) + '.' + d.date.slice(5,7), // 'DD.MM' (simple)
    balance: Number(d.balance)
  })) : [];

  const isPositive = changePercentage >= 0;
  const changeClass = isPositive ? styles.positiveChange : styles.negativeChange;
  const arrow = isPositive ? "▲" : "▼";

  return (
    <div className={styles.chartContainer}>
      <div className={styles.header}>
        <div className={styles.balanceInfo}>
          <p className={styles.dateTitle}>Баланс - {date}</p>
          <p className={styles.balanceValue}>{currentBalance}$</p>
        </div>

        <div className={styles.changeInfo}>
          <p className={styles.previousDay}>З попереднього дня</p>
          <span className={changeClass}>
            {arrow}
            {Math.abs(changePercentage)}%
          </span>
        </div>
      </div>

      <div className={styles.graphWrapper}>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid stroke="#333" vertical={true} />
            <XAxis dataKey="date" stroke="#999" tick={{ fill: '#999' }} tickLine={false} />
            <YAxis stroke="#999" tick={{ fill: '#999' }} tickLine={false} domain={['auto','auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #555", borderRadius: "8px", color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#00FF1A" }}
              formatter={(value) => [`${value}$`, "Баланс"]}
            />
            <Line type="monotone" dataKey="balance" stroke="#00FF1A" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

BalanceChart.propTypes = {
  currentBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  date: PropTypes.string.isRequired,
  changePercentage: PropTypes.number.isRequired,
  data: PropTypes.array
};

BalanceChart.defaultProps = { data: [] };
