'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import { calculateDashboardStats, getHighestValueAtRisk } from '@/lib/calculations';
import { TrendingUp, AlertOctagon, CornerDownRight } from 'lucide-react';

interface FinancialRiskProps {
  medicines: Medicine[];
}

export default function FinancialRisk({ medicines }: FinancialRiskProps) {
  const stats = calculateDashboardStats(medicines);
  const highestRisks = getHighestValueAtRisk(medicines, 5);

  const formatBDT = (value: number) => {
    return `৳ ${Math.round(value).toLocaleString('en-US')}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:grid md:grid-cols-2 gap-8">
      {/* Left Column: Aggregated Financial Risk */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertOctagon className="h-5 w-5 text-rose-500" />
          <h3 className="font-bold text-slate-800 text-lg">Financial Expiry Risk</h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium text-sm">Expired Stock Value</span>
            <span className="text-rose-600 font-bold text-base">
              {formatBDT(stats.expired.totalValue)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium text-sm">Expiring ≤30 Days Stock Value</span>
            <span className="text-amber-600 font-bold text-base">
              {formatBDT(stats.expiring30.totalValue)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 pb-1">
            <span className="text-slate-900 font-bold text-sm sm:text-base">Total Immediate Risk</span>
            <span className="text-rose-700 font-black text-xl sm:text-2xl">
              {formatBDT(stats.immediateRiskValue)}
            </span>
          </div>

          <p className="text-xs text-slate-400 italic">
            * Immediate risk represents expired value combined with stock expiring in the next 30 days. Value calculated based on unit purchase price.
          </p>
        </div>
      </div>

      {/* Right Column: Highest Value at Risk Items */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 text-lg">Highest Value at Risk</h3>
        </div>

        {highestRisks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-xl p-6 bg-slate-50">
            <span className="text-slate-400 text-sm text-center">No active medicines are expired or expiring within 30 days.</span>
          </div>
        ) : (
          <div className="flex-1 space-y-3">
            {highestRisks.map((item, idx) => (
              <div
                key={item.medicine.id}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                  <div>
                    <h4 className="font-semibold text-slate-700 text-sm">
                      {item.medicine.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>Batch: {item.medicine.batch}</span>
                      <span>•</span>
                      <span
                        className={
                          item.category === 'expired'
                            ? 'text-rose-600 font-medium'
                            : 'text-amber-600 font-medium'
                        }
                      >
                        {item.daysRemaining < 0
                          ? 'Expired'
                          : `${item.daysRemaining} days remaining`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 text-sm">
                    {formatBDT(item.valueAtRisk)}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {item.medicine.quantity} x {formatBDT(item.medicine.unitPriceBDT)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
