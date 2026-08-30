'use client';

import React, { useEffect, useState } from 'react';
import { DashboardStats } from '@/lib/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ExpiryChartProps {
  stats: DashboardStats;
}

export default function ExpiryChart({ stats }: ExpiryChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    { name: 'Expired', value: stats.expired.totalValue, color: '#f43f5e' }, // rose-500
    { name: '0–30 Days', value: stats.expiring30.totalValue, color: '#f59e0b' }, // amber-500
    { name: '31–90 Days', value: stats.expiring90.totalValue, color: '#0ea5e9' }, // sky-500
    { name: 'Safe (90+)', value: stats.safe.totalValue, color: '#10b981' }, // emerald-500
  ];

  const formatBDT = (value: number) => {
    return `৳${Math.round(value).toLocaleString('en-US')}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full min-h-[350px]">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-indigo-500" />
        <h3 className="font-bold text-slate-800 text-lg">Value by Expiry Status</h3>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={formatBDT}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#64748b"
                fontSize={12}
                width={85}
                tickLine={false}
                axisLine={false}
                className="font-medium"
              />
              <Tooltip
                formatter={(value: any) => [formatBDT(Number(value) || 0), 'Stock Value']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontFamily: 'sans-serif',
                }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl">
            <span className="text-slate-400 text-sm">Loading chart...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
        {data.map((item) => (
          <div key={item.name} className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate max-w-[70px] sm:max-w-none">
                {item.name}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
              {formatBDT(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
