'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Package, Truck, Settings, TrendingDown, ShoppingBag } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Active Inventory',
      href: '/inventory',
      icon: Package,
    },
    {
      name: 'Expiry Loss',
      href: '/expiry-loss',
      icon: TrendingDown,
    },
    {
      name: 'Sell Medicine',
      href: '/sell',
      icon: ShoppingBag,
    },
    {
      name: 'Returned to Distributor',
      href: '/returned',
      icon: Truck,
    },
  ];

  // Only show Settings to pharmacy owners
  if (profile?.role === 'owner') {
    navItems.push({
      name: 'Workspace Settings',
      href: '/settings',
      icon: Settings,
    });
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
