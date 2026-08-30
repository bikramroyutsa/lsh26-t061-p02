'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePharmacy } from '@/context/PharmacyContext';
import {
  LayoutDashboard,
  Package,
  Truck,
  RotateCcw,
  Leaf,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Active Inventory', href: '/inventory', icon: Package },
  { name: 'Returned', href: '/returned', icon: Truck },
];

export default function Header() {
  const { resetData } = usePharmacy();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setMounted(true);
    setDateStr(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset the database to the 42 sample medicines?')) {
      resetData();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-[68px] gap-6">

          {/* ── Brand ─────────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-fg flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-serif font-bold tracking-tight text-fg text-[18px] leading-tight">
                MediShelf
              </div>
              <div className="font-mono text-[10px] text-muted leading-none tracking-wide">
                Khulna Pharmacy
              </div>
            </div>
          </div>

          {/* ── Desktop Nav (centered) ─────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-fg text-white'
                      : 'text-muted hover:text-fg hover:bg-border/60'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* ── Right controls ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
            {mounted && (
              <div className="font-mono text-[11px] text-muted bg-white border border-border px-3 py-1.5 rounded-full">
                {dateStr}
              </div>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-muted hover:text-fg border border-border rounded-full bg-white hover:bg-bg transition-all duration-300 cursor-pointer"
              title="Reset to 42 sample medicines"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
