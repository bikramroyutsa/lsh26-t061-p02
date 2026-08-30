'use client';

import React from 'react';
import { MedicineRiskInfo } from '@/lib/calculations';
import { AlertTriangle } from 'lucide-react';

interface UrgentBannerProps {
  items: MedicineRiskInfo[];
}

export default function UrgentBanner({ items }: UrgentBannerProps) {
  return (
    <div className="clay-card border-expired-border bg-expired-bg/50 p-6 md:p-8 animate-fade-up">
      {/* Heading */}
      <div className="flex items-center gap-3 mb-5">
        <div className="animate-pulse-dot text-expired">
          <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <span className="font-mono text-[10px] font-medium tracking-widest uppercase text-expired">
          Urgent — Expiring Within 2 Days
        </span>
      </div>

      {/* Item rows */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.medicine.id}
            className="flex items-center justify-between bg-white border border-expired-border/50 shadow-sm rounded-2xl px-5 py-4 transition-all duration-300 hover:shadow-md hover:border-expired/30"
          >
            <div>
              <div className="font-semibold text-fg text-sm leading-tight">
                {item.medicine.name}
              </div>
              <div className="font-mono text-[11px] text-muted mt-1">
                {item.medicine.batch}&nbsp;·&nbsp;{item.medicine.quantity} units
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-mono text-sm font-semibold ${
                  item.daysRemaining === 0 ? 'text-expired' : 'text-interactive'
                }`}
              >
                {item.daysRemaining === 0
                  ? 'Expires Today'
                  : `${item.daysRemaining} day${item.daysRemaining !== 1 ? 's' : ''} left`}
              </div>
              <div className="font-mono text-[11px] text-muted mt-0.5">
                ৳&thinsp;{Math.round(item.valueAtRisk).toLocaleString('en-US')} at risk
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
