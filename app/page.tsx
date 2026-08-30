'use client';

import React from 'react';
import {
  calculateDashboardStats,
  getUrgentMedicines,
  getMonthlyExpiryForecast,
} from '@/lib/calculations';
import { usePharmacy } from '@/context/PharmacyContext';
import SummaryCards from '@/components/dashboard/SummaryCards';
import FinancialRisk from '@/components/dashboard/FinancialRisk';
import ExpiryChart from '@/components/dashboard/ExpiryChart';
import UrgentBanner from '@/components/dashboard/UrgentBanner';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { medicines, loading } = usePharmacy();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={1.5} />
        <span className="font-sans text-sm text-muted">Loading dashboard…</span>
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
        <div className="lg:col-span-5">
          <ExpiryChart forecast={forecast} />
        </div>
      </div>
    </div>
  );
}
