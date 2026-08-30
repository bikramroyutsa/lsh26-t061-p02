'use client';

import React, { useState } from 'react';
import { Medicine } from '@/types/medicine';
import {
  getWeeklyRiskBuckets,
  MedicineRiskInfo,
  WeeklyRiskBucket,
  getMedicinePrice,
} from '@/lib/calculations';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface FinancialRiskProps {
  medicines: Medicine[];
}

type FilterBucketId = 'all_upcoming' | '0-7' | '8-14' | '14-21' | '22-28' | 'expired';

export default function FinancialRisk({ medicines }: FinancialRiskProps) {
  const analysis = getWeeklyRiskBuckets(medicines);
  const [selectedBucket, setSelectedBucket] = useState<FilterBucketId>('all_upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const formatBDT = (value: number) =>
    `৳ ${Math.round(value).toLocaleString('en-US')}`;

  // Determine active medicines to show in list based on selected filter
  let displayedMedicines: MedicineRiskInfo[] = [];
  let currentBucketTitle = 'All Upcoming Expiry (0–28 Days)';

  if (selectedBucket === 'all_upcoming') {
    displayedMedicines = analysis.allExpiringMedicines;
    currentBucketTitle = 'All Upcoming Expiry (0–28 Days)';
  } else if (selectedBucket === 'expired') {
    displayedMedicines = analysis.expiredMedicines;
    currentBucketTitle = 'Expired Stock (Realized Loss)';
  } else {
    const matched = analysis.buckets.find((b) => b.id === selectedBucket);
    if (matched) {
      displayedMedicines = matched.medicines;
      currentBucketTitle = `${matched.label} Risk (${matched.subtitle})`;
    }
  }

  // Filter with search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    displayedMedicines = displayedMedicines.filter(
      (item) =>
        item.medicine.name.toLowerCase().includes(q) ||
        item.medicine.company.toLowerCase().includes(q) ||
        item.medicine.batch.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Summary: Realized Expired Loss vs Upcoming Possible Loss ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Confirmed Expired Loss (Strictly Expired Items) */}
        <div
          onClick={() => setSelectedBucket(selectedBucket === 'expired' ? 'all_upcoming' : 'expired')}
          className={`clay-card p-6 border transition-all duration-200 cursor-pointer group ${
            selectedBucket === 'expired'
              ? 'ring-2 ring-expired ring-offset-2 bg-expired-bg/40'
              : 'hover:border-expired/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-expired-bg text-expired">
                <AlertOctagon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-expired">
                  Realized Loss (Expired)
                </span>
                <p className="text-xs text-muted">Stock past expiration date</p>
              </div>
            </div>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-expired-bg text-expired border border-expired-border">
              {analysis.expiredCount} items
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="font-serif text-3xl md:text-4xl font-bold text-expired tracking-tight">
              {formatBDT(analysis.expiredLoss)}
            </div>
            <span className="font-mono text-xs text-muted">
              {analysis.expiredUnits.toLocaleString('en-US')} units lost
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted pt-3 border-t border-border">
            <span>Confirmed financial loss</span>
            <span className="text-expired font-medium group-hover:underline flex items-center gap-1">
              {selectedBucket === 'expired' ? 'Viewing in list' : 'View expired list'} &rarr;
            </span>
          </div>
        </div>

        {/* Total Upcoming Possible Loss (0–28 Days) */}
        <div
          onClick={() => setSelectedBucket('all_upcoming')}
          className={`clay-card p-6 border transition-all duration-200 cursor-pointer group ${
            selectedBucket === 'all_upcoming'
              ? 'ring-2 ring-warn ring-offset-2 bg-warn-bg/30'
              : 'hover:border-warn/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-warn-bg text-warn">
                <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-warn">
                  Upcoming Expiry Risk (0–28d)
                </span>
                <p className="text-xs text-muted">Potential loss next 4 weeks</p>
              </div>
            </div>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-warn-bg text-warn border border-warn-border">
              {analysis.totalExpiringCount} items
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="font-serif text-3xl md:text-4xl font-bold text-fg tracking-tight">
              {formatBDT(analysis.totalPossibleLoss)}
            </div>
            <span className="font-mono text-xs text-muted">
              {analysis.totalExpiringUnits.toLocaleString('en-US')} units at risk
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted pt-3 border-t border-border">
            <span>Potential capital loss if unsold</span>
            <span className="text-primary font-medium group-hover:underline flex items-center gap-1">
              {selectedBucket === 'all_upcoming' ? 'Viewing all 28d' : 'View all 28d'} &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* ── 4 Weekly Risk Buckets: 0-7d, 8-14d, 14-21d, 22-28d ── */}
      <div className="clay-card p-6 md:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <h3 className="font-serif italic text-lg text-fg">
                Weekly Risk Breakdown (0–28 Days)
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Select a risk window to inspect expiring medicines and possible financial loss.
            </p>
          </div>

          <button
            onClick={() => setSelectedBucket('all_upcoming')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer border ${
              selectedBucket === 'all_upcoming'
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-bg text-muted border-border hover:border-primary hover:text-fg'
            }`}
          >
            All Next 28 Days ({analysis.totalExpiringCount})
          </button>
        </div>

        {/* 4 Bucket Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {analysis.buckets.map((bucket) => {
            const isSelected = selectedBucket === bucket.id;
            const pctOfTotal =
              analysis.totalPossibleLoss > 0
                ? Math.min(100, (bucket.possibleLoss / analysis.totalPossibleLoss) * 100)
                : 0;

            return (
              <button
                key={bucket.id}
                onClick={() => setSelectedBucket(bucket.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary bg-bg shadow-sm ring-1 ring-primary'
                    : 'border-border bg-white hover:border-border-hover hover:bg-bg/50'
                }`}
              >
                {/* Header tag */}
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: bucket.badgeBg,
                        color: bucket.accentColor,
                      }}
                    >
                      {bucket.label}
                    </span>
                    <span className="font-mono text-[11px] font-medium text-muted">
                      {bucket.count} med{bucket.count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted mt-1.5 line-clamp-1">
                    {bucket.subtitle}
                  </p>
                </div>

                {/* Amount */}
                <div className="mt-4">
                  <div className="text-xs font-medium text-muted">Possible Loss:</div>
                  <div
                    className="font-mono text-base font-bold mt-0.5"
                    style={{ color: bucket.possibleLoss > 0 ? bucket.accentColor : 'var(--muted)' }}
                  >
                    {formatBDT(bucket.possibleLoss)}
                  </div>
                  <p className="font-mono text-[10px] text-muted mt-0.5">
                    {bucket.totalQuantity.toLocaleString('en-US')} units
                  </p>

                  {/* Micro progress bar */}
                  <div className="h-1 bg-border/60 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pctOfTotal}%`,
                        backgroundColor: bucket.accentColor,
                      }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Medicines About to Expire (Interactive List) ── */}
      <div className="clay-card p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <h3 className="font-serif italic text-lg text-fg">
                {currentBucketTitle}
              </h3>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Showing {displayedMedicines.length} medicine{displayedMedicines.length !== 1 ? 's' : ''} with individual possible loss calculations.
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this list…"
              className="w-full pl-9 pr-3 py-2 bg-bg border border-border rounded-xl text-xs text-fg placeholder-muted focus:outline-none focus:border-primary transition-colors font-sans"
            />
          </div>
        </div>

        {/* Medicines Table / List */}
        {displayedMedicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-2xl">
            <Calendar className="w-8 h-8 text-muted/50 mb-2" strokeWidth={1.5} />
            <p className="text-sm text-muted italic text-center">
              No medicines found matching this risk timeframe or search query.
            </p>
            {selectedBucket !== 'all_upcoming' && (
              <button
                onClick={() => {
                  setSelectedBucket('all_upcoming');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                View all upcoming medicines &rarr;
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedMedicines.map((item, idx) => {
              const isExpired = item.daysRemaining < 0;
              const unitPrice = getMedicinePrice(item.medicine);

              // Determine tag badge
              let badgeColor = 'var(--watch-color)';
              let badgeBg = 'var(--watch-bg)';
              let badgeText = `${item.daysRemaining}d left`;

              if (isExpired) {
                badgeColor = 'var(--expired-color)';
                badgeBg = 'var(--expired-bg)';
                badgeText = `Expired ${Math.abs(item.daysRemaining)}d ago`;
              } else if (item.daysRemaining <= 7) {
                badgeColor = 'var(--expired-color)';
                badgeBg = 'var(--expired-bg)';
                badgeText = item.daysRemaining === 0 ? 'Expires Today' : `${item.daysRemaining}d left (0–7d)`;
              } else if (item.daysRemaining <= 14) {
                badgeColor = 'var(--warn-color)';
                badgeBg = 'var(--warn-bg)';
                badgeText = `${item.daysRemaining}d left (8–14d)`;
              } else if (item.daysRemaining <= 21) {
                badgeColor = '#D97706';
                badgeBg = '#FFFBEB';
                badgeText = `${item.daysRemaining}d left (14–21d)`;
              } else {
                badgeColor = 'var(--watch-color)';
                badgeBg = 'var(--watch-bg)';
                badgeText = `${item.daysRemaining}d left (22–28d)`;
              }

              return (
                <div
                  key={item.medicine.id || `med-risk-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white border border-border hover:border-primary/40 hover:bg-bg/60 transition-all duration-200 gap-3"
                >
                  {/* Left: Medicine info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="font-mono text-xs text-muted w-5 pt-0.5 flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-fg truncate">
                          {item.medicine.name}
                        </span>
                        <span className="text-xs text-muted">
                          &bull; {item.medicine.company}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                        <span className="font-mono text-[11px] text-muted">
                          Batch: <span className="font-medium text-fg">{item.medicine.batch}</span>
                        </span>
                        <span className="text-border">&bull;</span>
                        <span className="font-mono text-[11px] text-muted">
                          Expiry: <span className="font-medium text-fg">{item.medicine.expiryDate || item.medicine.expiry}</span>
                        </span>
                        <span className="text-border">&bull;</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: badgeBg,
                            color: badgeColor,
                          }}
                        >
                          {badgeText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity & Possible Loss */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border flex-shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-muted block sm:inline">
                        {isExpired ? 'Realized Loss: ' : 'Possible Loss: '}
                      </span>
                      <span
                        className="font-mono text-sm font-bold ml-1 sm:ml-0"
                        style={{ color: isExpired ? 'var(--expired-color)' : 'var(--fg)' }}
                      >
                        {formatBDT(item.valueAtRisk)}
                      </span>
                    </div>

                    <p className="font-mono text-[10px] text-muted mt-0.5">
                      {item.medicine.quantity} units &times; {formatBDT(unitPrice)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action footer */}
        <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-muted italic">
            Calculated based on active batch quantities and unit purchase price in BDT (৳).
          </p>
          <Link
            href="/inventory"
            className="text-primary font-medium hover:underline flex items-center gap-1 self-end sm:self-auto cursor-pointer"
          >
            Manage full inventory &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
