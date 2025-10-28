import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Legend from '../Legend/Legend.jsx';
const data = [
  { name: 'Оренда житла', value: 600, color: '#FF9800' }, 
  { name: 'Розваги', value: 900, color: '#4CAF50' }, 
  { name: 'Продукти', value: 1400, color: '#F44336' }, 
  { name: 'Одяг', value: 900, color: '#9C27B0' }, 
];

export default function SpendingPieChart() {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value" 
            nameKey="name"  
            cx="50%"        
            cy="50%"        
            innerRadius={60} 
            outerRadius={90}
            paddingAngle={2} 
            fill="#8884d8"   
          >

            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <Legend data={data} />
    </div>
  );
}


