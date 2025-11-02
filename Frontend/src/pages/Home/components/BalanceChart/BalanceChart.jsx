import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./BalanceChart.module.css";
import PropTypes from "prop-types";

const data = [
  { date: "01.09", balance: 150 },
  { date: "05.09", balance: 350 },
  { date: "09.09", balance: 500 },
  { date: "13.09", balance: 380 },
  { date: "21.09", balance: 250 },
  { date: "28.09", balance: 900 },
  { date: "02.10", balance: 800 },
  { date: "05.10", balance: 950 },
];

export default function BalanceChart({
  currentBalance,
  date,
  changePercentage,
}) {
  const isPositive = changePercentage >= 0;
  const changeClass = isPositive
    ? styles.positiveChange
    : styles.negativeChange;
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
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              stroke="#333" 
              vertical={true}
              fill="#0C0B0B"
            />
            
            <XAxis 
              dataKey="date" 
              stroke="#999" 
              tick={{ fill: '#999' }}
              tickLine={false}
            />
            
            <YAxis 
              stroke="#999" 
              tick={{ fill: '#999' }}
              tickLine={false}
              domain={[0, 1000]}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #555",
                borderRadius: "8px",
                color: "#fff"
              }}
              labelStyle={{ color: "#fff" }}
              itemStyle={{ color: "#00FF1A" }}
              formatter={(value) => [`${value}$`, "Баланс"]}
            />
            
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#00FF1A"
              strokeWidth={2}
              dot={{ fill: "#00FF1A", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

BalanceChart.propTypes = {
  currentBalance: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  date: PropTypes.string.isRequired,
  changePercentage: PropTypes.number.isRequired,
};