'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { calculateDashboardStats } from '@/lib/calculations';
import SummaryCards from '@/components/dashboard/SummaryCards';
import FinancialRisk from '@/components/dashboard/FinancialRisk';
import ExpiryChart from '@/components/dashboard/ExpiryChart';
import { Loader2, Plus, Server, PackageOpen } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { medicines, loading, resetData } = usePharmacy();
  const [seeding, setSeeding] = useState(false);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-slate-500 font-medium text-sm">Loading dashboard metrics...</span>
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
      <div className="min-h-[450px] flex items-center justify-center py-10 px-4 animate-fadeIn">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 text-center space-y-6">
          <div className="mx-auto bg-slate-50 text-slate-400 p-4 rounded-2xl w-fit">
            <PackageOpen className="h-9 w-9" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Empty Workspace Inventory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              This pharmacy workspace has no medicines logged in stock. You can start building your inventory manually, or load default sample data to explore analytics features.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
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
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 text-slate-400" />
              <span>Add Medicine</span>
            </Link>
          </div>
        </div>
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
