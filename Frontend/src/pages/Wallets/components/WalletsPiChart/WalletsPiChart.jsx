import React from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './WalletsPiChart.module.css';

const defaultColors = ['#FF9F1C', '#17E66A', '#FF1E2D', '#D48BD6', '#34B5FF','#ffffff',];

function formatAmount(n) {
  if (n == null) return '-';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n) + '$';
}

export default function WalletsPiChart({
  segments = [],
  walletsPosition = 'under'
}) {
  const data = Array.isArray(segments) ? segments.map(s => ({ ...s, value: Number(s.value) || 0 })) : [];
  const total = data.reduce((s, it) => s + (it.value || 0), 0);

  return (
    <div className={styles.summary}>
      <div className={styles.left}>
        <div className={styles.chartWrap} aria-hidden>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={data}
            dataKey="value" 
            nameKey="name"  
            cx="50%"        
            cy="50%"        
            innerRadius={70} 
            outerRadius={90}
            fill="#8884d8"   
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || defaultColors[index % defaultColors.length]}
                    stroke="rgba(0,0,0,0.12)"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className={styles.legend}>
          {data.map((s, i) => {
            const pct = total ? Math.round((s.value / total) * 100) : 0;
            const color = s.color || defaultColors[i % defaultColors.length];
            return (
              <li key={s.id || s.label} className={styles.legendItem}>
                <span className={styles.dot} style={{ background: color }} />
                <div className={styles.legendTextWrap}>
                  <div className={styles.legendMain}>
                    <span className={styles.labelText}>{s.label}</span>
                    <span className={styles.smallText}> — {pct}% {formatAmount(s.value)}</span>
                  </div>

                  {Array.isArray(s.wallets) && s.wallets.length > 0 && (
                    walletsPosition === 'beside' ? (
                      <div className={styles.walletsInline}>
                        {s.wallets.join(', ')}
                      </div>
                    ) : (
                      <div className={styles.wallets}>
                        {s.wallets.map((w, idx) => (
                          <span key={w + idx} className={styles.walletPill}>{w}</span>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.right}>
        <div className={styles.totalLabel}>Загальна сума:</div>
        <div className={styles.totalValue}>{formatAmount(total)}</div>
      </div>
    </div>
  );
}

WalletsPiChart.propTypes = {
  segments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      color: PropTypes.string,
      wallets: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  walletsPosition: PropTypes.oneOf(['under','beside'])
};

WalletsPiChart.defaultProps = {
  segments: [],
  walletsPosition: 'under'
};
