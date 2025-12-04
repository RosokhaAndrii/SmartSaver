// src/pages/Home/components/SpendingPieChart/SpendingPieChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
import Legend from '../Legend/Legend.jsx';

export default function SpendingPieChart({ data = [] }) {
  const safeData = data.length ? data : [{ name: 'Немає даних', value: 1, color: '#666' }];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={safeData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            fill="#8884d8"
            stroke="none"
          >
            {safeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || (['#FF9800','#4CAF50','#F44336','#9C27B0'][index % 4])} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <Legend data={safeData} />
    </div>
  );
}
SpendingPieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string,
  })),
}