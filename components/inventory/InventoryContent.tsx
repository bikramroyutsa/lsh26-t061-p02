'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePharmacy } from '@/context/PharmacyContext';
import { getDaysRemaining, formatLocalDate } from '@/lib/expiry';
import { getExpiryCategory, getCategoryLabel, getMedicinePrice, getMedicineValue, getMedicineExpiry } from '@/lib/calculations';
import SearchFilter from '@/components/inventory/SearchFilter';
import MedicineForm from '@/components/inventory/MedicineForm';
import InventoryTable from '@/components/inventory/InventoryTable';
import { Loader2, Trash2, AlertTriangle, Download } from 'lucide-react';
import { Medicine } from '@/types/medicine';

export default function InventoryContent() {
  const { medicines, loading, clearInventory } = usePharmacy();
  const searchParams = useSearchParams();

  // Initialize filter from URL query param set by dashboard KPI card links
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearInventory = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      // Auto-reset the armed state after 4 seconds
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    setIsClearing(true);
    try {
      await clearInventory();
    } finally {
      setIsClearing(false);
      setConfirmClear(false);
    }
  };

  const exportToCSV = (medicines: Medicine[]) => {
    const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const headers = ['Medicine', 'Company', 'Batch', 'Quantity', 'Unit Price (BDT)', 'Total Value (BDT)', 'Expiry Date', 'Days Remaining', 'Status'];
    const rows = medicines.map((m) => {
      const expiry = getMedicineExpiry(m);
      const days = getDaysRemaining(expiry);
      const category = getExpiryCategory(days);
      const daysLabel = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today' : `${days}d`;
      return [
        q(m.name),
        q(m.company),
        q(m.batch),
        m.quantity,
        getMedicinePrice(m).toFixed(2),
        getMedicineValue(m).toFixed(2),
        q(expiry ? formatLocalDate(expiry) : 'N/A'),
        q(daysLabel),
        q(getCategoryLabel(category)),
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filterLabel = statusFilter === 'all' ? 'all' : statusFilter;
    a.href = url;
    a.download = `inventory_${filterLabel}_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="self-end sm:self-auto flex items-center gap-3">
          {/* Export CSV */}
          <button
            id="btn-export-csv"
            onClick={() => exportToCSV(filteredMedicines)}
            disabled={filteredMedicines.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-bg border border-border text-muted hover:text-primary hover:border-primary transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            id="btn-empty-inventory"
            onClick={handleClearInventory}
            disabled={isClearing}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              confirmClear
                ? 'bg-red-600 text-white ring-2 ring-red-400 animate-pulse'
                : 'bg-bg border border-border text-muted hover:text-red-500 hover:border-red-400'
            }`}
          >
            {isClearing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : confirmClear ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>
              {isClearing ? 'Clearing…' : confirmClear ? 'Confirm? Click again!' : 'Empty Inventory'}
            </span>
          </button>

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
