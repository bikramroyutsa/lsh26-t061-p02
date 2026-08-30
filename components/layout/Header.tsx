'use client';

import React, { useEffect, useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { Calendar, RotateCcw, Activity } from 'lucide-react';

export default function Header() {
  const { resetData } = usePharmacy();
  const [mounted, setMounted] = useState(false);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    setDateStr(
      today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 md:py-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-rose-500 text-white p-1.5 rounded-lg">
                <Activity className="h-6 w-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Pharmacy Expiry Shelf Check
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Khulna Pharmacy &bull; Inventory expiry monitoring & financial risk
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 self-start md:self-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 font-medium">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Today: {mounted ? dateStr : '...'}</span>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset the database to sample medicines?')) {
                  resetData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Reset stock list to original 42 sample medicines"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
