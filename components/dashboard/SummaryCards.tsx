'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardStats } from '@/lib/calculations';
import { AlertCircle, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface SummaryCardsProps {
  stats: DashboardStats;
  totalActive: number;
}

const CARDS = [
  {
    title: 'Expired',
    subtitle: 'Past expiry date',
    key: 'expired' as const,
    icon: AlertCircle,
    accentColor: 'var(--expired-color)',
    textColor: 'var(--expired-color)',
    bg: 'var(--expired-bg)',
    borderColor: 'var(--expired-border)',
    href: '/inventory?status=expired',
  },
  {
    title: 'Expiring ≤30 Days',
    subtitle: '0 to 30 days remaining',
    key: 'expiring30' as const,
    icon: AlertTriangle,
    accentColor: 'var(--warn-color)',
    textColor: 'var(--warn-color)',
    bg: 'var(--warn-bg)',
    borderColor: 'var(--warn-border)',
    href: '/inventory?status=expiring30',
  },
  {
    title: 'Watch 31–90 Days',
    subtitle: '31 to 90 days remaining',
    key: 'expiring90' as const,
    icon: Clock,
    accentColor: 'var(--watch-color)',
    textColor: 'var(--watch-color)',
    bg: 'var(--watch-bg)',
    borderColor: 'var(--watch-border)',
    href: '/inventory?status=expiring90',
  },
  {
    title: 'Safe',
    subtitle: 'More than 90 days',
    key: 'safe' as const,
    icon: CheckCircle,
    accentColor: 'var(--safe-color)',
    textColor: 'var(--safe-color)',
    bg: 'var(--safe-bg)',
    borderColor: 'var(--safe-border)',
    href: '/inventory?status=safe',
  },
];

export default function SummaryCards({ stats, totalActive }: SummaryCardsProps) {
  const formatBDT = (value: number) =>
    `৳ ${Math.round(value).toLocaleString('en-US')}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const data = stats[card.key];
        const pct =
          totalActive > 0
            ? Math.min(100, (data.count / totalActive) * 100)
            : 0;

        return (
          <Link
            key={card.key}
            href={card.href}
            className="clay-card clay-card-lift block p-5 md:p-6 group"
          >
            {/* Top row: label + icon */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p
                  className="text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: card.textColor }}
                >
                  {card.title}
                </p>
                <p className="text-[11px] text-muted mt-0.5 leading-tight">
                  {card.subtitle}
                </p>
              </div>
              <div
                className="p-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: card.bg }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: card.accentColor }}
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Big count */}
            <div
              className="font-serif text-5xl md:text-6xl font-bold leading-none mb-1"
              style={{ color: card.accentColor }}
            >
              {data.count}
            </div>

            {/* Value */}
            <div
              className="font-mono text-sm font-medium mb-4"
              style={{ color: card.textColor }}
            >
              {formatBDT(data.totalValue)}
            </div>

            {/* Progress bar */}
            <div
              className="h-[3px] rounded-full"
              style={{ backgroundColor: card.borderColor }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  backgroundColor: card.accentColor,
                }}
              />
            </div>
            <p className="font-mono text-[10px] text-muted mt-1.5">
              {data.totalQuantity.toLocaleString('en-US')} units &middot;{' '}
              {pct.toFixed(0)}% of active stock
            </p>
          </Link>
        );
      })}
    </div>
  );
}
