'use client';

import React, { useState } from 'react';
import { Medicine } from '@/types/medicine';
import { usePharmacy } from '@/context/PharmacyContext';
import { getDaysRemaining, formatLocalDate } from '@/lib/expiry';
import { getExpiryCategory, getCategoryLabel, getMedicineValue, getMedicinePrice, getMedicineExpiry } from '@/lib/calculations';
import { Trash2 } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface InventoryTableProps {
  medicines: Medicine[];
}

export default function InventoryTable({ medicines }: InventoryTableProps) {
  const { returnMedicine } = usePharmacy();
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const formatBDT = (value: number) => {
    return `৳${value.toFixed(2)}`;
  };

  const getDaysRemainingLabel = (days: number) => {
    if (days < 0) {
      const positiveDays = Math.abs(days);
      return positiveDays === 1 ? '1 day ago' : `${positiveDays} days ago`;
    }
    if (days === 0) return 'Today';
    return days === 1 ? '1 day' : `${days} days`;
  };

  const getStatusBadgeStyle = (category: string) => {
    switch (category) {
      case 'expired':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'expiring30':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'expiring90':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'safe':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400 mb-3">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium text-sm">No medicines in this category.</p>
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
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4 text-right">Days Remaining</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 sm:px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {medicines.map((m) => {
              const days = getDaysRemaining(getMedicineExpiry(m));
              const category = getExpiryCategory(days);
              const label = getCategoryLabel(category);
              const value = getMedicineValue(m);

              return (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Medicine Name */}
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                    {m.name}
                  </td>
                  {/* Company */}
                  <td className="py-3.5 px-4 text-slate-500">{m.company}</td>
                  {/* Batch */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                      {m.batch}
                    </span>
                  </td>
                  {/* Qty */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                    {m.quantity.toLocaleString('en-US')}
                  </td>
                  {/* Unit Price */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                    {formatBDT(getMedicinePrice(m))}
                  </td>
                  {/* Total Value */}
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatBDT(value)}
                  </td>
                  {/* Expiry Date */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {formatLocalDate(getMedicineExpiry(m))}
                  </td>
                  {/* Days Remaining */}
                  <td
                    className={`py-3.5 px-4 text-right font-semibold ${
                      days < 0
                        ? 'text-rose-600'
                        : days <= 30
                        ? 'text-amber-600'
                        : days <= 90
                        ? 'text-sky-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {getDaysRemainingLabel(days)}
                  </td>
                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                        category
                      )}`}
                    >
                      {label}
                    </span>
                  </td>
                  {/* Action Return button */}
                  <td className="py-3.5 px-4 sm:px-6 text-center">
                    <button
                      onClick={() => setSelectedMedicine(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg transition-colors cursor-pointer"
                      title="Return Stock to Distributor"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Return</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Custom Confirmation Popup */}
      <ConfirmationModal
        isOpen={selectedMedicine !== null}
        title="Confirm Stock Return"
        message={
          selectedMedicine
            ? `Are you sure you want to return ${selectedMedicine.name} (Batch: ${selectedMedicine.batch}) to the distributor? It will leave the active inventory and dashboard risk counts.`
            : ''
        }
        confirmLabel="Confirm Return"
        variant="danger"
        onConfirm={() => {
          if (selectedMedicine) {
            returnMedicine(selectedMedicine.id);
            setSelectedMedicine(null);
          }
        }}
        onCancel={() => setSelectedMedicine(null)}
      />
    </div>
  );
}
