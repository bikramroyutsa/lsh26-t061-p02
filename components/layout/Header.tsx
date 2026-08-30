'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePharmacy } from '@/context/PharmacyContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, RotateCcw, LogOut, Loader2, Leaf, LayoutDashboard, Package, Truck, Settings, Plus } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Active Inventory', href: '/inventory', icon: Package },
  { name: 'Returned', href: '/returned', icon: Truck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Header() {
  const { resetData } = usePharmacy();
  const pathname = usePathname();
  const {
    signOut,
    user,
    pharmacy,
    ownedPharmacies,
    switchPharmacy,
    refreshProfile,
  } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // New Workspace Creation Dialog States
  const [isNewPharmacyOpen, setIsNewPharmacyOpen] = useState(false);
  const [newPharmacyName, setNewPharmacyName] = useState('');
  const [creatingPharmacy, setCreatingPharmacy] = useState(false);

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

  useEffect(() => {
    if (pharmacy?.name) {
      document.title = `${pharmacy.name} — MediShelf`;
    } else {
      document.title = 'MediShelf';
    }
  }, [pharmacy?.name]);

  const handleCreateNewPharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPharmacyName.trim() || !user) return;
    setCreatingPharmacy(true);
    try {
      // 1. Create the new pharmacy record
      const { data: pharm, error: createError } = await supabase
        .from('pharmacies')
        .insert({
          name: newPharmacyName.trim(),
          owner_id: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // 2. Set user as approved owner of this pharmacy (upsert profile)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        pharmacy_id: pharm.id,
        role: 'owner',
        status: 'approved',
        email: user.email || '',
      });

      if (profileError) throw profileError;

      setNewPharmacyName('');
      setIsNewPharmacyOpen(false);
      await refreshProfile();
    } catch (err) {
      console.error('Failed to create new pharmacy workspace:', err);
      alert('Failed to create workspace.');
    } finally {
      setCreatingPharmacy(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-[68px] gap-6">

          {/* ── Brand ─────────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div>
              <div className="font-serif font-bold tracking-tight text-fg text-[18px] leading-tight">
                {pharmacy?.name || 'MediShelf'}
              </div>
              <div className="font-mono text-[10px] text-muted leading-none tracking-wide mt-0.5">
                Workspace
              </div>
            </div>
            {mounted && user && (
              <button
                onClick={() => setIsNewPharmacyOpen(true)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-bg border border-border text-muted hover:text-fg hover:border-primary transition-all duration-300"
                title="Create New Workspace"
              >
                <Plus className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
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

          {/* ── Controls (Workspace, Date, Sign Out) ───────────────────── */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 ml-auto justify-end">


            {mounted && (
              <div className="hidden md:flex font-mono text-[11px] text-muted bg-white border border-border px-3 py-1.5 rounded-full">
                {dateStr}
              </div>
            )}

            <button
              onClick={() => setIsConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-muted hover:text-fg hover:bg-border/60 transition-all duration-300 cursor-pointer"
              title="Reset stock list to original 42 sample medicines"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setIsSignOutOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-muted hover:text-expired hover:bg-expired-bg transition-all duration-300 cursor-pointer"
              title="Sign out of Pharmacy Portal"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </header>

      {/* Confirmation for database reset */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Reset Stock Data"
        message="Are you sure you want to reset the database to the original 42 sample medicines? All your current active changes and returns will be overwritten."
        confirmLabel="Reset Data"
        variant="danger"
        onConfirm={() => {
          resetData();
          setIsConfirmOpen(false);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Confirmation for Sign Out */}
      <ConfirmationModal
        isOpen={isSignOutOpen}
        title="Confirm Sign Out"
        message="Are you sure you want to log out of the Pharmacy Expiry Shelf Check dashboard?"
        confirmLabel="Sign Out"
        variant="info"
        onConfirm={() => {
          signOut();
          setIsSignOutOpen(false);
        }}
        onCancel={() => setIsSignOutOpen(false)}
      />

      {/* Create New Pharmacy Workspace Modal */}
      {isNewPharmacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="clay-card w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-lg font-serif font-bold text-fg">Create New Workspace</h3>
              <p className="text-xs text-muted mt-1">
                Register an additional pharmacy workspace under your administration.
              </p>
            </div>

            <form onSubmit={handleCreateNewPharmacy} className="space-y-4">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-muted mb-1.5">
                  Pharmacy Name
                </label>
                <input
                  type="text"
                  value={newPharmacyName}
                  onChange={(e) => setNewPharmacyName(e.target.value)}
                  placeholder="e.g. Opsonin Pharmacy"
                  className="block w-full px-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewPharmacyOpen(false);
                    setNewPharmacyName('');
                  }}
                  className="px-4 py-2 text-xs font-medium text-muted hover:text-fg hover:bg-border/60 rounded-full transition-all duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPharmacy}
                  className="inline-flex items-center justify-center min-w-[140px] gap-1.5 px-4 py-2 text-xs font-medium text-white bg-interactive hover:opacity-90 rounded-full transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  {creatingPharmacy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>Create Workspace</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
