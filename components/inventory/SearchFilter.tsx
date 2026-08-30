'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4.5 w-4.5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search medicine name, manufacturer, or batch number..."
          className="block w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Status Filter Dropdown */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
          <Filter className="h-4 w-4" />
        </div>
        <div className="relative flex-1">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="block w-full py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none cursor-pointer font-medium"
          >
            <option value="all">All Expiry Statuses</option>
            <option value="expired">Expired</option>
            <option value="expiring30">Expiring ≤30 Days</option>
            <option value="expiring90">Expiring 31–90 Days</option>
            <option value="safe">Safe</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
