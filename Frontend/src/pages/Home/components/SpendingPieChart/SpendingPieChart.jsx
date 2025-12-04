import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
import Legend from '../Legend/Legend.jsx';

const DEFAULT_COLORS = [
  '#FF9800', '#4CAF50', '#F44336', '#9C27B0', '#2196F3', '#FFC107', '#00BCD4', '#8BC34A'
];

export default function SpendingPieChart({ data = [] }) {
  const safeData = data && data.length ? data : [{ name: 'Немає даних', value: 1, color: '#666' }];
  const mappedData = safeData.map((item, idx) => {
    const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
    return { ...item, color };
  });

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={mappedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            stroke="none"
          >
            {mappedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <Legend data={mappedData} />
    </div>
  );
}

SpendingPieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string,
  })),
};
