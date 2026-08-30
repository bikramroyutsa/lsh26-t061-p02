'use client';

import React, { useState, useMemo } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import {
  calculateExpiryLossBreakdown,
  getMedicinePrice,
  getMedicineExpiry,
  LossIntervalKey,
  IntervalStats,
} from '@/lib/calculations';
import { formatLocalDate, getDaysRemaining } from '@/lib/expiry';
import { Medicine } from '@/types/medicine';
import {
  AlertCircle,
  Clock,
  CornerUpLeft,
  Search,
  Loader2,
  Package,
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function ExpiryLossPage() {
  const { medicines, loading, returnMedicine } = usePharmacy();
  const [selectedTab, setSelectedTab] = useState<LossIntervalKey | 'all-to-expire'>('expired');
  const [searchQuery, setSearchQuery] = useState('');
  const [returningMed, setReturningMed] = useState<Medicine | null>(null);

  const breakdown = useMemo(() => {
    return calculateExpiryLossBreakdown(medicines);
  }, [medicines]);

  const formatBDT = (val: number) => `৳ ${Math.round(val).toLocaleString('en-US')}`;

  // Gather items based on selected tab
  const currentTabItems = useMemo(() => {
    let list: { medicine: Medicine; daysRemaining: number; valueAtRisk: number; intervalLabel: string }[] = [];

    if (selectedTab === 'expired') {
      list = breakdown.alreadyExpired.items.map((item) => ({
        ...item,
        intervalLabel: breakdown.alreadyExpired.label,
      }));
    } else if (selectedTab === 'all-to-expire') {
      breakdown.toExpireIntervals.forEach((interval) => {
        interval.items.forEach((item) => {
          list.push({
            ...item,
            intervalLabel: interval.label,
          });
        });
      });
    } else {
      const found = breakdown.toExpireIntervals.find((i) => i.key === selectedTab);
      if (found) {
        list = found.items.map((item) => ({
          ...item,
          intervalLabel: found.label,
        }));
      }
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.medicine.name.toLowerCase().includes(q) ||
        item.medicine.company.toLowerCase().includes(q) ||
        item.medicine.batch.toLowerCase().includes(q)
    );
  }, [breakdown, selectedTab, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={1.5} />
        <span className="font-sans text-sm text-muted">Calculating expiry loss breakdown…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-expired-bg text-expired">
              <TrendingDown className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif italic text-3xl md:text-4xl text-fg tracking-tight">
              Expiry Loss Categorization
            </h2>
          </div>
          <p className="text-sm text-muted mt-1 max-w-3xl leading-relaxed">
            Strict separation between <strong>Already Expired stock (Realized Loss)</strong> and <strong>To Expire stock (Upcoming Potential Loss)</strong> grouped into 7-day intervals.
          </p>
        </div>
      </div>

      {/* ── Main Category Overview Cards (Already Expired vs To Expire) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category 1: Already Expired (Realized Loss) */}
        <div className="clay-card p-6 border-l-4 border-l-expired relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-expired-bg text-expired uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" />
                Category 1: Already Expired
              </div>
              <h3 className="font-serif text-xl font-bold text-fg mt-3">
                Realized Financial Loss
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Medicines past their expiration date. Stock cannot be sold.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <span className="font-serif text-4xl md:text-5xl font-bold text-expired">
              {formatBDT(breakdown.totalAlreadyExpiredLoss)}
            </span>
            <div className="font-mono text-xs text-muted">
              <span className="font-semibold text-fg">{breakdown.alreadyExpired.count}</span> medicines &middot;{' '}
              <span className="font-semibold text-fg">{breakdown.alreadyExpired.totalQuantity.toLocaleString()}</span> total units
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted">Impact Status:</span>
            <span className="font-medium text-expired">Full Value Loss (Requires Return)</span>
          </div>
        </div>

        {/* Category 2: To Expire (Upcoming Potential Loss) */}
        <div className="clay-card p-6 border-l-4 border-l-warn relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warn-bg text-warn uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                Category 2: To Expire (0–28 Days)
              </div>
              <h3 className="font-serif text-xl font-bold text-fg mt-3">
                Upcoming Loss Amount
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Active stock expiring within the next 4 weeks (0 to 28 days).
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <span className="font-serif text-4xl md:text-5xl font-bold text-warn">
              {formatBDT(breakdown.totalToLose28Days)}
            </span>
            <div className="font-mono text-xs text-muted">
              <span className="font-semibold text-fg">
                {breakdown.toExpireIntervals.reduce((acc, i) => acc + i.count, 0)}
              </span> medicines &middot;{' '}
              <span className="font-semibold text-fg">
                {breakdown.toExpireIntervals.reduce((acc, i) => acc + i.totalQuantity, 0).toLocaleString()}
              </span> units to lose
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted">Action Recommendation:</span>
            <span className="font-medium text-warn">Prioritize Clearance / Return before expiry</span>
          </div>
        </div>

      </div>

      {/* ── Interval Breakdown Cards (0-7d, 8-14d, 15-21d, 22-28d) ──────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif italic text-xl text-fg">
            Upcoming Loss Intervals (0 to 28 Days Breakdown)
          </h3>
          <span className="text-xs text-muted font-mono">4 Weekly Intervals</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {breakdown.toExpireIntervals.map((interval) => {
            const isSelected = selectedTab === interval.key;
            return (
              <button
                key={interval.key}
                onClick={() => setSelectedTab(interval.key)}
                className={`clay-card p-5 text-left transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-warn shadow-md bg-warn-bg/20'
                    : 'hover:border-warn/50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-warn-bg text-warn">
                    {interval.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {interval.count} items
                  </span>
                </div>

                <div className="font-serif text-2xl font-bold text-fg mb-1">
                  {formatBDT(interval.totalValue)}
                </div>

                <p className="text-xs text-muted">
                  {interval.totalQuantity.toLocaleString()} units to lose
                </p>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
                  <span>Window:</span>
                  <span className="font-medium text-fg">{interval.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table Section with Tabs & Search ─────────────────────────────── */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          <button
            onClick={() => setSelectedTab('expired')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              selectedTab === 'expired'
                ? 'bg-expired text-white shadow-sm font-semibold'
                : 'bg-bg border border-border text-muted hover:text-fg'
            }`}
          >
            Already Expired (Loss: {formatBDT(breakdown.totalAlreadyExpiredLoss)})
          </button>

          {breakdown.toExpireIntervals.map((interval) => (
            <button
              key={interval.key}
              onClick={() => setSelectedTab(interval.key)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                selectedTab === interval.key
                  ? 'bg-warn text-white shadow-sm font-semibold'
                  : 'bg-bg border border-border text-muted hover:text-fg'
              }`}
            >
              {interval.label} ({formatBDT(interval.totalValue)})
            </button>
          ))}

          <button
            onClick={() => setSelectedTab('all-to-expire')}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              selectedTab === 'all-to-expire'
                ? 'bg-fg text-white shadow-sm font-semibold'
                : 'bg-bg border border-border text-muted hover:text-fg'
            }`}
          >
            All To Expire (0–28d: {formatBDT(breakdown.totalToLose28Days)})
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name, company or batch..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-full text-xs text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="text-xs text-muted font-mono">
            Showing <strong className="text-fg">{currentTabItems.length}</strong> items in selected view
          </div>
        </div>

        {/* Medicines Table */}
        <div className="clay-card overflow-hidden">
          {currentTabItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Package className="w-10 h-10 text-muted mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-fg">No medicines in this category</p>
              <p className="text-xs text-muted mt-1">There are no records matching your current filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    {['Medicine Name & Company', 'Batch', 'Quantity', 'Unit Price', 'Loss / To Lose Value', 'Expiry Date', 'Remaining', 'Interval Category', 'Action'].map((h) => (
                      <th
                        key={h}
                        className="py-3.5 px-4 first:pl-6 last:pr-6 text-[10px] font-medium uppercase tracking-widest text-muted whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentTabItems.map(({ medicine: m, daysRemaining, valueAtRisk, intervalLabel }) => {
                    const isExpired = daysRemaining < 0;
                    return (
                      <tr
                        key={m.id}
                        className="border-b border-border last:border-0 hover:bg-bg/60 transition-colors"
                      >
                        <td className="py-4 px-4 pl-6">
                          <div className="font-semibold text-fg text-sm">{m.name}</div>
                          <div className="text-[11px] text-muted mt-0.5">{m.company}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-muted">
                          <span className="px-2 py-0.5 rounded bg-bg border border-border">
                            {m.batch}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-sm font-medium text-fg">
                          {m.quantity.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-muted">
                          {formatBDT(getMedicinePrice(m))}
                        </td>
                        <td className="py-4 px-4 font-mono text-sm font-semibold text-fg">
                          <span className={isExpired ? 'text-expired font-bold' : 'text-warn font-semibold'}>
                            {formatBDT(valueAtRisk)}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-muted">
                          {formatLocalDate(getMedicineExpiry(m))}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs font-semibold">
                          <span className={isExpired ? 'text-expired' : 'text-warn'}>
                            {isExpired ? `${Math.abs(daysRemaining)}d ago` : daysRemaining === 0 ? 'Today' : `${daysRemaining}d left`}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`font-mono text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                              isExpired ? 'bg-expired-bg text-expired' : 'bg-warn-bg text-warn'
                            }`}
                          >
                            {intervalLabel}
                          </span>
                        </td>
                        <td className="py-4 px-4 pr-6">
                          <button
                            onClick={() => setReturningMed(m)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-interactive hover:text-white hover:bg-interactive border border-border hover:border-interactive rounded-full transition-all cursor-pointer whitespace-nowrap"
                          >
                            <CornerUpLeft className="w-3 h-3" />
                            Return
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Return */}
      <ConfirmationModal
        isOpen={returningMed !== null}
        title="Confirm Stock Return"
        message={
          returningMed
            ? `Are you sure you want to return ${returningMed.name} (Batch: ${returningMed.batch}) to the distributor? It will remove its loss value from active counts.`
            : ''
        }
        confirmLabel="Confirm Return"
        variant="danger"
        onConfirm={() => {
          if (returningMed) {
            returnMedicine(returningMed.id);
            setReturningMed(null);
          }
        }}
        onCancel={() => setReturningMed(null)}
      />
    </div>
  );
}
