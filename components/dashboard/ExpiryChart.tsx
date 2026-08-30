'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ExpiryChartProps {
  forecast: Array<{ month: string; value: number }>;
}

// High-saturation botanical bar palette
const BAR_COLORS = [
  'var(--expired-color)',
  'var(--warn-color)',
  '#D97706',
  'var(--watch-color)',
  'var(--safe-color)',
  '#7C3AED',
];

export default function ExpiryChart({ forecast }: ExpiryChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const formatShort = (v: number) =>
    v >= 1000 ? `৳${(v / 1000).toFixed(1)}k` : `৳${v}`;

  const formatFull = (v: number) =>
    `৳ ${Math.round(v).toLocaleString('en-US')}`;

  const hasData = forecast.some((d) => d.value > 0);

  return (
    <div className="clay-card p-6 md:p-8 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <h3 className="font-serif italic text-lg text-fg">
          Value Expiring
        </h3>
      </div>
      <p className="text-xs text-muted mb-7">
        Next 6 months — stock purchase value by calendar month
      </p>

      <div className="flex-1 min-h-[200px]">
        {!mounted ? (
            <div className="w-5 h-5 border-2 border-primary/25 border-t-primary rounded-full animate-spin" />
        ) : !hasData ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-muted italic text-center">
              No stock expiring in the next 6 months.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={forecast} barCategoryGap="38%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  fontSize: 10,
                  fill: 'var(--muted)',
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  fill: 'var(--muted)',
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ fill: 'var(--bg)', opacity: 0.5 }}
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                }}
                itemStyle={{
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--fg)',
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {forecast.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={BAR_COLORS[i % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
