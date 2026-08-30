'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  counts: Record<string, number>;
}

const FILTER_TABS = [
  { key: 'all',        label: 'All',          activeColor: 'var(--fg)' },
  { key: 'expired',    label: 'Expired',      activeColor: 'var(--expired-color)' },
  { key: 'expiring30', label: '≤30 Days',     activeColor: 'var(--warn-color)' },
  { key: 'expiring90', label: '31–90 Days',   activeColor: 'var(--watch-color)' },
  { key: 'safe',       label: 'Safe',         activeColor: 'var(--safe-color)' },
];

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  counts,
}: SearchFilterProps) {
  return (
    <div className="space-y-4">
      {/* ── Search ────────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-4 h-4 text-primary" strokeWidth={1.5} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, manufacturer, or batch…"
          className="w-full pl-11 pr-10 py-3 bg-white border border-border rounded-2xl text-sm text-fg placeholder-muted focus:outline-none focus:border-primary transition-colors duration-300 font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* ── Filter chips ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = statusFilter === tab.key;
          const count = counts[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={() => onStatusChange(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer border ${
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white text-muted border-border hover:border-primary hover:text-fg'
              }`}
              style={
                isActive
                  ? { backgroundColor: tab.activeColor, borderColor: tab.activeColor }
                  : undefined
              }
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-bg text-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
