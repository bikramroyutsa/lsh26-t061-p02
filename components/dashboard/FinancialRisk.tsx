'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import {
  calculateDashboardStats,
  getHighestValueAtRisk,
} from '@/lib/calculations';
import { AlertOctagon, TrendingUp } from 'lucide-react';

interface FinancialRiskProps {
  medicines: Medicine[];
}

export default function FinancialRisk({ medicines }: FinancialRiskProps) {
  const stats = calculateDashboardStats(medicines);
  const highestRisks = getHighestValueAtRisk(medicines, 5);

  const formatBDT = (value: number) =>
    `৳ ${Math.round(value).toLocaleString('en-US')}`;

  return (
    <div className="clay-card p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

        {/* ── Left: Aggregated financial risk ─────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-7">
            <AlertOctagon className="w-4 h-4 text-expired" strokeWidth={1.5} />
            <h3 className="font-serif italic text-lg text-fg">
              Financial Expiry Risk
            </h3>
          </div>

          <div className="space-y-0">
            <div className="flex justify-between items-center py-4 border-b border-border">
              <span className="text-sm text-muted">Expired Stock</span>
              <span className="font-mono text-sm font-semibold text-expired">
                {formatBDT(stats.expired.totalValue)}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-border">
              <span className="text-sm text-muted">Expiring ≤30 Days</span>
              <span className="font-mono text-sm font-semibold text-warn">
                {formatBDT(stats.expiring30.totalValue)}
              </span>
            </div>
            <div className="flex justify-between items-start py-4">
              <span className="text-sm font-semibold text-fg">
                Total Immediate Risk
              </span>
              <span className="font-serif text-2xl font-bold text-expired leading-tight">
                {formatBDT(stats.immediateRiskValue)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted italic mt-4 leading-relaxed">
            Expired value combined with stock expiring in the next 30 days,
            based on unit purchase price.
          </p>
        </div>

        {/* ── Right: Top 5 highest value at risk ──────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-7">
            <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h3 className="font-serif italic text-lg text-fg">
              Highest Value at Risk
            </h3>
          </div>

          {highestRisks.length === 0 ? (
            <div className="flex items-center justify-center h-[140px] border border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted italic text-center px-6">
                No urgent financial risk detected.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {highestRisks.map((item, idx) => (
                <div
                  key={item.medicine.id}
                  className="flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-bg transition-colors duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-muted w-4 flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-fg truncate leading-tight">
                        {item.medicine.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-muted">
                          {item.medicine.batch}
                        </span>
                        <span
                          className="text-[10px] font-semibold"
                          style={{
                            color:
                              item.category === 'expired'
                                ? 'var(--expired-color)'
                                : 'var(--warn-color)',
                          }}
                        >
                          {item.daysRemaining < 0
                            ? 'Expired'
                            : `${item.daysRemaining}d left`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-mono text-sm font-semibold text-fg">
                      {formatBDT(item.valueAtRisk)}
                    </p>
                    <p className="font-mono text-[10px] text-muted mt-0.5">
                      {item.medicine.quantity} ×{' '}
                      {formatBDT(item.medicine.unitPriceBDT)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
