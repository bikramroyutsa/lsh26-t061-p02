'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import { getMedicineValue } from '@/lib/calculations';
import { formatLocalDate } from '@/lib/expiry';
import { ArchiveRestore, CalendarRange } from 'lucide-react';

interface ReturnedTableProps {
  medicines: Medicine[];
}

export default function ReturnedTable({ medicines }: ReturnedTableProps) {
  const formatBDT = (value: number) => {
    return `৳${value.toFixed(2)}`;
  };

  if (medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400 mb-3">
          <ArchiveRestore className="h-6 w-6" />
        </div>
        <p className="text-slate-500 font-medium text-sm">No medicines have been returned yet.</p>
        <p className="text-xs text-slate-400 mt-1">
          When you click &quot;Return&quot; on an item in active stock, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 sm:px-6">Medicine</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Batch</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right">Total Value</th>
              <th className="py-3 px-4">Original Expiry</th>
              <th className="py-3 px-4 sm:px-6">Returned Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {medicines.map((m) => {
              const value = getMedicineValue(m);

              return (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Name */}
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                    {m.name}
                  </td>
                  {/* Company */}
                  <td className="py-3.5 px-4 text-slate-500">{m.company}</td>
                  {/* Batch */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {m.batch}
                    </span>
                  </td>
                  {/* Quantity */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                    {m.quantity.toLocaleString('en-US')}
                  </td>
                  {/* Unit price */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                    {formatBDT(m.unitPriceBDT)}
                  </td>
                  {/* Total Value */}
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatBDT(value)}
                  </td>
                  {/* Original Expiry */}
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {formatLocalDate(m.expiryDate)}
                  </td>
                  {/* Returned Date */}
                  <td className="py-3.5 px-4 sm:px-6 text-indigo-600 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <CalendarRange className="h-3.5 w-3.5 text-indigo-400" />
                      <span>{m.returnedDate ? formatLocalDate(m.returnedDate) : 'N/A'}</span>
                    </div>
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
