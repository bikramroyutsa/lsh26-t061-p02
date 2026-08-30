'use client';

import React from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import ReturnedTable from '@/components/returned/ReturnedTable';
import { Loader2 } from 'lucide-react';

export default function ReturnedPage() {
  const { medicines, loading } = usePharmacy();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={1.5} />
        <span className="font-sans text-sm text-muted">Loading return records…</span>
      </div>
    );
  }

  const returnedMedicines = medicines.filter((m) => m.returned);

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="font-serif italic text-3xl md:text-4xl text-fg tracking-tight">
          Returned
        </h2>
        <p className="text-sm text-muted mt-1">
          Archive of expired or near-expiry stock returned to distributors for refund or credit.
        </p>
      </div>

      <ReturnedTable medicines={returnedMedicines} />
    </div>
  );
}
