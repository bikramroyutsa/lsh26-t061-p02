'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { getDaysRemaining } from '@/lib/expiry';
import { getExpiryCategory } from '@/lib/calculations';
import SearchFilter from '@/components/inventory/SearchFilter';
import MedicineForm from '@/components/inventory/MedicineForm';
import InventoryTable from '@/components/inventory/InventoryTable';
import { Loader2 } from 'lucide-react';

export default function InventoryPage() {
  const { medicines, loading } = usePharmacy();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-slate-500 font-medium text-sm">Loading stock list...</span>
      </div>
    );
  }

  // Get active medicines (exclude returned)
  const activeMedicines = medicines.filter((m) => !m.returned);

  // Apply search query and status filter in combination
  const filteredMedicines = activeMedicines.filter((m) => {
    // 1. Search filter: Match Name, Company, or Batch (case-insensitive)
    const matchStr = searchQuery.toLowerCase().trim();
    const matchesSearch =
      matchStr === '' ||
      m.name.toLowerCase().includes(matchStr) ||
      m.company.toLowerCase().includes(matchStr) ||
      m.batch.toLowerCase().includes(matchStr);

    // 2. Status filter
    const days = getDaysRemaining(m.expiryDate);
    const category = getExpiryCategory(days);
    const matchesFilter = statusFilter === 'all' || category === statusFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header section with page description & quick add action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-700 tracking-tight">Active Stock Shelves</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Search, filter, and track medicine expiry dates. Return expired and expiring items to distributor.
          </p>
        </div>
        <div className="self-end sm:self-auto">
          <MedicineForm />
        </div>
      </div>

      {/* Search & Filters Controls */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Main Stock Table */}
      <InventoryTable medicines={filteredMedicines} />
    </div>
  );
}
