'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import { usePharmacy } from '@/context/PharmacyContext';
import { getDaysRemaining, formatLocalDate } from '@/lib/expiry';
import {
  getExpiryCategory,
  getCategoryLabel,
  getMedicineValue,
} from '@/lib/calculations';
import { CornerUpLeft, Package } from 'lucide-react';

interface InventoryTableProps {
  medicines: Medicine[];
}

type StyleKey = 'expired' | 'expiring30' | 'expiring90' | 'safe';

const STATUS_STYLE: Record<StyleKey, { badge: string; days: string }> = {
  expired:    { badge: 'bg-expired-bg text-expired',  days: 'text-expired'  },
  expiring30: { badge: 'bg-warn-bg text-warn',  days: 'text-warn'  },
  expiring90: { badge: 'bg-watch-bg text-watch',  days: 'text-watch'  },
  safe:       { badge: 'bg-safe-bg text-safe',  days: 'text-safe'  },
};

export default function InventoryTable({ medicines }: InventoryTableProps) {
  const { returnMedicine } = usePharmacy();

  const formatBDT = (value: number) => `৳ ${value.toFixed(2)}`;

  const getDaysLabel = (days: number) => {
    if (days < 0) return `${Math.abs(days)}d ago`;
    if (days === 0) return 'Today';
    return `${days}d`;
  };

  if (medicines.length === 0) {
    return (
      <div className="clay-card flex flex-col items-center justify-center p-16 text-center">
        <div className="w-12 h-12 rounded-full bg-bg border border-border flex items-center justify-center mb-4">
          <Package className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-fg">
          No medicines in this category
        </p>
        <p className="text-xs text-muted mt-1">
          Try adjusting the filter or search query
        </p>
      </div>
    );
  }

  return (
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
                'Expiry',
                'Days',
                'Status',
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
              const days = getDaysRemaining(m.expiryDate);
              const category = getExpiryCategory(days);
              const label = getCategoryLabel(category);
              const value = getMedicineValue(m);
              const s = STATUS_STYLE[category as StyleKey] ?? STATUS_STYLE.safe;

              return (
                <tr
                  key={m.id}
                  className="border-b border-border last:border-0 hover:bg-bg transition-colors duration-200"
                >
                  {/* Medicine name + company */}
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

                  {/* Expiry Date */}
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-muted">
                      {formatLocalDate(m.expiryDate)}
                    </span>
                  </td>

                  {/* Days remaining */}
                  <td className="py-4 px-4">
                    <span className={`font-mono text-sm font-semibold ${s.days}`}>
                      {getDaysLabel(days)}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="py-4 px-4">
                    <span
                      className={`font-mono text-[10px] font-semibold px-2.5 py-1 rounded-full ${s.badge}`}
                    >
                      {label}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 pr-6">
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Return ${m.name} (${m.batch}) to the distributor?`
                          )
                        ) {
                          returnMedicine(m.id);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-interactive hover:text-white hover:bg-interactive border border-[#E8CEBE] hover:border-interactive rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap"
                      title="Return to Distributor"
                    >
                      <CornerUpLeft className="w-3 h-3" strokeWidth={1.5} />
                      Return
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
