'use client';

import React from 'react';
import { Leaf, PackageOpen, TrendingDown, Clock, ShieldAlert, ArrowRight, Store } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-bg flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <header className="absolute top-0 w-full px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-fg flex items-center justify-center shadow-lg">
            <Leaf className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <span className="font-serif font-bold text-xl text-fg tracking-tight">MediShelf</span>
        </div>
        <button
          onClick={onLogin}
          className="px-5 py-2 text-sm font-semibold text-fg hover:text-white bg-white hover:bg-fg border border-border rounded-full transition-all duration-300 shadow-sm cursor-pointer"
        >
          Sign In
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 z-10 pt-20 pb-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-safe-bg border border-safe-border text-safe text-xs font-mono font-medium mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-safe"></span>
            </span>
            Real-time Inventory Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-fg leading-[1.1] tracking-tight">
            Stop losing capital to <span className="text-expired">expired medicine.</span>
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            MediShelf brings real-time expiry risk tracking, financial valuation, and multi-branch inventory management to your pharmacy's fingertips.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLogin}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all duration-300 w-full sm:w-auto cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
          
          <div className="clay-card p-8 rounded-3xl space-y-4 hover:shadow-[0_8px_30px_rgba(6,78,59,0.06)] transition-shadow">
            <div className="w-12 h-12 bg-interactive/10 rounded-2xl flex items-center justify-center text-interactive mb-6">
              <Clock className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif font-bold text-lg text-fg">Smart Expiry Alerts</h3>
            <p className="text-sm text-muted leading-relaxed">
              Never let stock quietly expire again. Urgent visual banners flag medicines expiring within the next 48 hours to prioritize sales.
            </p>
          </div>

          <div className="clay-card p-8 rounded-3xl space-y-4 hover:shadow-[0_8px_30px_rgba(6,78,59,0.06)] transition-shadow">
            <div className="w-12 h-12 bg-expired-bg border border-expired-border rounded-2xl flex items-center justify-center text-expired mb-6">
              <TrendingDown className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif font-bold text-lg text-fg">Financial Risk Analytics</h3>
            <p className="text-sm text-muted leading-relaxed">
              Instantly view exactly how much capital is tied up in at-risk stock. Track your potential losses before they happen.
            </p>
          </div>

          <div className="clay-card p-8 rounded-3xl space-y-4 hover:shadow-[0_8px_30px_rgba(6,78,59,0.06)] transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Store className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif font-bold text-lg text-fg">Multi-Workspace Support</h3>
            <p className="text-sm text-muted leading-relaxed">
              Manage multiple pharmacy branches from one account. Effortlessly switch between workspaces and securely onboard team members.
            </p>
          </div>

        </div>
      </main>

      {/* Footer / Event Details */}
      <footer className="w-full py-6 mt-auto border-t border-border/50 z-10 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs font-mono text-muted">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-fg">Team:</span> LSH26-T061
          </div>
          <div className="hidden sm:block text-border">•</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-fg">Problem:</span> P02
          </div>
          <div className="hidden sm:block text-border">•</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-fg">Event Code:</span> LSH26-8490-C900
          </div>
        </div>
      </footer>
    </div>
  );
}
