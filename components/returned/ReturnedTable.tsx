'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import { getMedicineValue } from '@/lib/calculations';
import { formatLocalDate } from '@/lib/expiry';
import { usePharmacy } from '@/context/PharmacyContext';
import { ArchiveRestore, CalendarRange, RotateCcw } from 'lucide-react';

interface ReturnedTableProps {
  medicines: Medicine[];
}

export default function ReturnedTable({ medicines }: ReturnedTableProps) {
  const { unreturnMedicine } = usePharmacy();

  const formatBDT = (value: number) => `৳ ${value.toFixed(2)}`;
  const totalValue = medicines.reduce((sum, m) => sum + getMedicineValue(m), 0);

  if (medicines.length === 0) {
    return (
      <div className="clay-card flex flex-col items-center justify-center p-16 text-center">
        <div className="w-12 h-12 rounded-full bg-bg border border-border flex items-center justify-center mb-4">
          <ArchiveRestore className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-fg">No medicines returned yet</p>
        <p className="text-xs text-muted mt-1">
          Click &ldquo;Return&rdquo; on an active stock item to move it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Summary stats ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 px-1">
        <div>
          <span className="font-mono text-2xl font-bold text-fg">
            {medicines.length}
          </span>
          <span className="text-sm text-muted ml-2">items returned</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div>
          <span className="font-mono text-xl font-semibold text-interactive">
            ৳&thinsp;{Math.round(totalValue).toLocaleString('en-US')}
          </span>
          <span className="text-sm text-muted ml-2">total value</span>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg">
                {[
                  'Medicine',
                  'Batch',
                  'Qty',
                  'Unit Price',
                  'Total Value',
                  'Original Expiry',
                  'Returned Date',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="py-4 px-4 first:pl-6 last:pr-6 text-[10px] font-medium uppercase tracking-widest text-muted whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => {
                const value = getMedicineValue(m);
                return (
                  <tr
                    key={m.id}
                    className="border-b border-border last:border-0 hover:bg-bg transition-colors duration-200"
                  >
                    {/* Medicine + Company */}
                    <td className="py-4 px-4 pl-6">
                      <div className="font-semibold text-fg text-sm leading-tight">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {m.company}
                      </div>
                    </td>

                    {/* Batch */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] bg-bg border border-border text-muted px-2 py-1 rounded-lg">
                        {m.batch}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-fg font-medium">
                        {m.quantity.toLocaleString('en-US')}
                      </span>
                    </td>

                    {/* Unit Price */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-muted">
                        {formatBDT(m.unitPriceBDT)}
                      </span>
                    </td>

                    {/* Total Value */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm font-semibold text-fg">
                        {formatBDT(value)}
                      </span>
                    </td>

                    {/* Original Expiry */}
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-muted">
                        {formatLocalDate(m.expiryDate)}
                      </span>
                    </td>

                    {/* Returned Date */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-sm text-primary">
                        <CalendarRange className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                        {m.returnedDate ? formatLocalDate(m.returnedDate) : '—'}
                      </div>
                    </td>

                    {/* Undo action */}
                    <td className="py-4 px-4 pr-6">
                      <button
                        onClick={() => unreturnMedicine(m.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted hover:text-fg border border-border hover:border-primary rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap"
                        title="Undo return — restore to active stock"
                      >
                        <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
                        Undo
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
