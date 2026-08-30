'use client';

import React from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { calculateDashboardStats } from '@/lib/calculations';
import SummaryCards from '@/components/dashboard/SummaryCards';
import FinancialRisk from '@/components/dashboard/FinancialRisk';
import ExpiryChart from '@/components/dashboard/ExpiryChart';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { medicines, loading } = usePharmacy();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-slate-500 font-medium text-sm">Loading dashboard metrics...</span>
      </div>
    );
  }

  const stats = calculateDashboardStats(medicines);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Info Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-700 tracking-tight">Overview Summary</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Real-time count of active stock, total units, and capital valuation grouped by expiry risk.
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={stats} />

      {/* Analytics and Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <FinancialRisk medicines={medicines} />
        </div>
        <div className="lg:col-span-5">
          <ExpiryChart stats={stats} />
        </div>
      </div>
    </div>
  );
}
