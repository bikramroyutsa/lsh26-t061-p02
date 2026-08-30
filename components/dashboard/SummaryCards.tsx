'use client';

import React from 'react';
import { DashboardStats } from '@/lib/calculations';
import { AlertCircle, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface SummaryCardsProps {
  stats: DashboardStats;
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const formatBDT = (value: number) => {
    return `৳ ${Math.round(value).toLocaleString('en-US')}`;
  };

  const cards = [
    {
      title: 'Expired',
      subtitle: 'Expiry date is in the past',
      count: stats.expired.count,
      quantity: stats.expired.totalQuantity,
      value: stats.expired.totalValue,
      icon: AlertCircle,
      colors: {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        valueText: 'text-rose-800',
        iconBg: 'bg-rose-100',
        iconText: 'text-rose-600',
      },
    },
    {
      title: 'Expiring ≤30 Days',
      subtitle: '0 to 30 days remaining',
      count: stats.expiring30.count,
      quantity: stats.expiring30.totalQuantity,
      value: stats.expiring30.totalValue,
      icon: AlertTriangle,
      colors: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        valueText: 'text-amber-800',
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-600',
      },
    },
    {
      title: 'Expiring 31–90 Days',
      subtitle: '31 to 90 days remaining',
      count: stats.expiring90.count,
      quantity: stats.expiring90.totalQuantity,
      value: stats.expiring90.totalValue,
      icon: Clock,
      colors: {
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        text: 'text-sky-700',
        valueText: 'text-sky-800',
        iconBg: 'bg-sky-100',
        iconText: 'text-sky-600',
      },
    },
    {
      title: 'Safe',
      subtitle: 'More than 90 days remaining',
      count: stats.safe.count,
      quantity: stats.safe.totalQuantity,
      value: stats.safe.totalValue,
      icon: CheckCircle,
      colors: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        valueText: 'text-emerald-800',
        iconBg: 'bg-emerald-100',
        iconText: 'text-emerald-600',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const c = card.colors;

        return (
          <div
            key={card.title}
            className={`flex flex-col justify-between p-5 rounded-2xl border ${c.bg} ${c.border} transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`font-bold text-base ${c.text}`}>{card.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-xl ${c.iconBg}`}>
                <Icon className={`h-5 w-5 ${c.iconText}`} />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1">
              <span className={`text-2xl font-extrabold tracking-tight ${c.valueText}`}>
                {formatBDT(card.value)}
              </span>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-1">
                <span>{card.count} Medicines</span>
                <span>•</span>
                <span>{card.quantity.toLocaleString('en-US')} units</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
