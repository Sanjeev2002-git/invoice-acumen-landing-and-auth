import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function RevenueChart({ revenue }) {
  const data = [
    { period: 'This Week', amount: revenue.weekly },
    { period: 'This Month', amount: revenue.monthly },
    { period: 'This Year', amount: revenue.yearly },
  ];

  return (
    <div className="evo-card p-4">
      <h3 className="font-semibold mb-4 text-white">Revenue Overview</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="evoRevenueBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="period" stroke="#9C99AC" tick={{ fill: '#9C99AC', fontSize: 12 }} />
          <YAxis stroke="#9C99AC" tick={{ fill: '#9C99AC', fontSize: 12 }} />
          <Tooltip
            formatter={(value) => `₹${value}`}
            contentStyle={{ background: '#17151F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F5F4F8' }}
            labelStyle={{ color: '#F5F4F8' }}
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          />
          <Bar dataKey="amount" fill="url(#evoRevenueBar)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
