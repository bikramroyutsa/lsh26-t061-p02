'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Truck, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Returned', href: '/returned', icon: Truck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 mx-1 my-1.5 py-1.5 rounded-xl space-y-1 transition-all duration-300 ${
                isActive ? 'bg-fg text-white' : 'text-muted hover:text-fg hover:bg-border/60'
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`}
              />
              <span className="text-[10px] font-bold tracking-wide uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
