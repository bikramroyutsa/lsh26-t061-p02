'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  calculateDashboardStats,
  getUrgentMedicines,
  getMonthlyExpiryForecast,
} from '@/lib/calculations';
import { usePharmacy } from '@/context/PharmacyContext';
import SummaryCards from '@/components/dashboard/SummaryCards';
import FinancialRisk from '@/components/dashboard/FinancialRisk';
import ExpiryChart from '@/components/dashboard/ExpiryChart';
import GeminiSuggestion from '@/components/dashboard/GeminiSuggestion';
import UrgentBanner from '@/components/dashboard/UrgentBanner';
import { Loader2, Plus, Server, PackageOpen } from 'lucide-react';

export default function DashboardPage() {
  const { medicines, loading, resetData } = usePharmacy();
  const [seeding, setSeeding] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={1.5} />
        <span className="font-sans text-sm text-muted">Loading dashboard…</span>
      </div>
    );
  }

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await resetData();
    } catch (e) {
      console.error('Seeding error:', e);
    } finally {
      setSeeding(false);
    }
  };

  // If no medicines are in inventory, display a beautiful empty state dashboard
  if (medicines.length === 0) {
    return (
      <div className="min-h-[450px] flex items-center justify-center py-10 px-4 animate-fade-up">
        <div className="max-w-md w-full bg-white border border-border rounded-[24px] p-8 text-center space-y-6 shadow-[0_8px_30px_rgba(6,78,59,0.04)]">
          <div className="mx-auto bg-bg text-primary p-4 rounded-2xl w-fit">
            <PackageOpen className="h-9 w-9" strokeWidth={1.5} />
          </div>

          <div>
            <h2 className="font-serif font-bold text-2xl text-fg tracking-tight">
              Empty Workspace Inventory
            </h2>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              This pharmacy workspace has no medicines logged in stock. You can start building your inventory manually, or load default sample data to explore analytics features.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-fg active:scale-[0.98] text-white font-medium text-[13px] rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Server className="h-4 w-4" />
                  <span>Load Sample Data</span>
                </>
              )}
            </button>

            <Link
              href="/inventory"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-bg border border-border text-fg font-medium text-[13px] rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>Add Medicine</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateDashboardStats(medicines);
  const urgentItems = getUrgentMedicines(medicines, 2);
  const forecast = getMonthlyExpiryForecast(medicines, 6);
  const totalActive = medicines.filter((m) => !m.returned).length;

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Page heading */}
      <div>
        <h2 className="font-serif italic text-3xl md:text-4xl text-fg tracking-tight">
          Overview
        </h2>
        <p className="text-sm text-muted mt-1">
          Real-time expiry risk and capital valuation for active stock.
        </p>
      </div>

      {/* Urgent banner — only shown when items expire within 2 days */}
      {urgentItems.length > 0 && <UrgentBanner items={urgentItems} />}

      {/* Summary KPI cards */}
      <SummaryCards stats={stats} totalActive={totalActive} />

      {/* Analytics row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <FinancialRisk medicines={medicines} />
        </div>
        <div className="lg:col-span-5 flex flex-col h-full">
          <ExpiryChart forecast={forecast} />
          <GeminiSuggestion medicines={medicines} />
        </div>
      </div>
    </div>
  );
}
