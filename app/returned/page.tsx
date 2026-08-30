'use client';

import React from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import ReturnedTable from '@/components/returned/ReturnedTable';
import { Loader2 } from 'lucide-react';

export default function ReturnedPage() {
  const { medicines, loading } = usePharmacy();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-slate-500 font-medium text-sm">Loading return records...</span>
      </div>
    );
  }

  // Filter medicines that are returned
  const returnedMedicines = medicines.filter((m) => m.returned);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section with page description */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 tracking-tight">Returned to Distributor</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Archive list of expired or near-expiry medicine stock returned to distributors for refund or credit.
        </p>
      </div>

      {/* Returned Table */}
      <ReturnedTable medicines={returnedMedicines} />
    </div>
  );
}
