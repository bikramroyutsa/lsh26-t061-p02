'use client';

import React, { useEffect, useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, RotateCcw, Activity, LogOut, Loader2 } from 'lucide-react';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function Header() {
  const { resetData } = usePharmacy();
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
    const today = new Date();
    setDateStr(
      today.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    );
  }, []);

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

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 self-start md:self-auto">
            {/* Workspace switcher for owners */}
            {mounted && user && ownedPharmacies.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider hidden lg:inline">
                  Workspace:
                </span>
                <select
                  value={pharmacy?.id || ''}
                  onChange={(e) => {
                    if (e.target.value === 'new') {
                      setIsNewPharmacyOpen(true);
                    } else {
                      switchPharmacy(e.target.value);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {ownedPharmacies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Owner)
                    </option>
                  ))}
                  <option value="new">+ Create New Workspace</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm text-slate-600 font-medium">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Today: {mounted ? dateStr : '...'}</span>
            </div>

            <button
              onClick={() => setIsConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Reset stock list to original 42 sample medicines"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Sample Data</span>
            </button>

            <button
              onClick={() => setIsSignOutOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Sign out of Pharmacy Portal"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Create New Workspace</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Register an additional pharmacy workspace under your administration.
              </p>
            </div>

            <form onSubmit={handleCreateNewPharmacy} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Pharmacy Name
                </label>
                <input
                  type="text"
                  value={newPharmacyName}
                  onChange={(e) => setNewPharmacyName(e.target.value)}
                  placeholder="e.g. Opsonin Pharmacy"
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewPharmacyOpen(false);
                    setNewPharmacyName('');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPharmacy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded-lg transition-colors cursor-pointer shadow-sm hover:shadow"
                >
                  {creatingPharmacy ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span>Create Workspace</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
