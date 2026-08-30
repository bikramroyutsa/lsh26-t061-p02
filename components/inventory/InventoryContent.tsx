'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePharmacy } from '@/context/PharmacyContext';
import { getDaysRemaining } from '@/lib/expiry';
import { getExpiryCategory } from '@/lib/calculations';
import SearchFilter from '@/components/inventory/SearchFilter';
import MedicineForm from '@/components/inventory/MedicineForm';
import InventoryTable from '@/components/inventory/InventoryTable';
import { Loader2 } from 'lucide-react';

export default function InventoryContent() {
  const { medicines, loading } = usePharmacy();
  const searchParams = useSearchParams();

  // Initialize filter from URL query param set by dashboard KPI card links
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={1.5} />
        <span className="font-sans text-sm text-muted">Loading stock list…</span>
      </div>
    );
  }

  const activeMedicines = medicines.filter((m) => !m.returned);

  // Compute counts for each category (used in filter chip badges)
  const counts: Record<string, number> = {
    all: activeMedicines.length,
    expired:    activeMedicines.filter((m) => getExpiryCategory(getDaysRemaining(m.expiryDate)) === 'expired').length,
    expiring30: activeMedicines.filter((m) => getExpiryCategory(getDaysRemaining(m.expiryDate)) === 'expiring30').length,
    expiring90: activeMedicines.filter((m) => getExpiryCategory(getDaysRemaining(m.expiryDate)) === 'expiring90').length,
    safe:       activeMedicines.filter((m) => getExpiryCategory(getDaysRemaining(m.expiryDate)) === 'safe').length,
  };

  const filteredMedicines = activeMedicines.filter((m) => {
    const matchStr = searchQuery.toLowerCase().trim();
    const matchesSearch =
      matchStr === '' ||
      m.name.toLowerCase().includes(matchStr) ||
      m.company.toLowerCase().includes(matchStr) ||
      m.batch.toLowerCase().includes(matchStr);

    const category = getExpiryCategory(getDaysRemaining(m.expiryDate));
    const matchesFilter = statusFilter === 'all' || category === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page heading + Add Medicine */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-serif italic text-3xl md:text-4xl text-fg tracking-tight">
            Active Stock
          </h2>
          <p className="text-sm text-muted mt-1">
            Search, filter, and track medicine expiry dates.
          </p>
        </div>
        <div className="self-end sm:self-auto">
          <MedicineForm />
        </div>
      </div>

      {/* Search + filter chips */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        counts={counts}
      />

      {/* Results */}
      <InventoryTable medicines={filteredMedicines} />
    </div>
  );
}
