'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { PlusCircle, Users, Loader2, ArrowRight, Store } from 'lucide-react';

interface PharmacyOption {
  id: string;
  name: string;
}

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const [pharmacies, setPharmacies] = useState<PharmacyOption[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);

  // Form states
  const [newPharmacyName, setNewPharmacyName] = useState('');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingJoin, setSubmittingJoin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPharmacies = async () => {
    try {
      setLoadingPharmacies(true);
      const { data, error } = await supabase
        .from('pharmacies')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setPharmacies(data || []);
      if (data && data.length > 0) {
        setSelectedPharmacyId(data[0].id);
      }
    } catch (e) {
      console.error('Error fetching pharmacies list:', e);
    } finally {
      setLoadingPharmacies(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPharmacyName.trim()) {
      setErrorMsg('Please enter a name for your pharmacy.');
      return;
    }
    if (!user) return;

    setSubmittingCreate(true);
    setErrorMsg('');

    try {
      // 1. Create the pharmacy record
      const { data: pharm, error: createError } = await supabase
        .from('pharmacies')
        .insert({
          name: newPharmacyName.trim(),
          owner_id: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!pharm) throw new Error('Failed to create pharmacy profile.');

      // 2. Set user as approved owner of this pharmacy
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          pharmacy_id: pharm.id,
          role: 'owner',
          status: 'approved',
          email: user.email || '',
        });

      if (profileError) throw profileError;

      // 3. Refresh Auth Profile context
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during pharmacy registration.');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPharmacyId) {
      setErrorMsg('Please select a pharmacy to join.');
      return;
    }
    if (!user) return;

    setSubmittingJoin(true);
    setErrorMsg('');

    try {
      // Set user as pending employee of selected pharmacy
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          pharmacy_id: selectedPharmacyId,
          role: 'employee',
          status: 'pending',
          email: user.email || '',
        });

      if (profileError) throw profileError;

      // Refresh Auth Profile context
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during access request submission.');
    } finally {
      setSubmittingJoin(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="clay-card max-w-2xl w-full p-6 sm:p-10 space-y-10 animate-fade-up">
        {/* Onboarding Header */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-fg text-primary p-3 rounded-full shadow-md">
            <Store className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-fg mt-6 tracking-tight">
            Select Your Pharmacy Workspace
          </h2>
          <p className="text-sm text-muted mt-2 leading-relaxed max-w-lg">
            Create a workspace as a pharmacy owner or request access to join an existing pharmacy team.
          </p>
        </div>

        {/* Error Messaging */}
        {errorMsg && (
          <div className="bg-expired-bg border border-expired-border text-expired text-xs sm:text-sm px-4 py-3 rounded-xl font-medium animate-in fade-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-border/50">
          {/* Owner: Create Option */}
          <div className="space-y-5 pt-4 md:pt-0 pr-0 md:pr-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h3 className="font-serif font-bold text-fg text-lg">Create a Workspace</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              If you own the store, register a new pharmacy workspace. You will instantly become its system administrator and can approve employees.
            </p>

            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-muted mb-1.5">
                  Pharmacy Name
                </label>
                <input
                  type="text"
                  value={newPharmacyName}
                  onChange={(e) => setNewPharmacyName(e.target.value)}
                  placeholder="e.g. Khulna Pharmacy"
                  className="block w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingCreate || submittingJoin}
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-primary hover:opacity-90 text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingCreate ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Create Workspace</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Employee: Join Option */}
          <div className="space-y-5 pt-8 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-interactive" strokeWidth={1.5} />
              <h3 className="font-serif font-bold text-fg text-lg">Join a Workspace</h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              If your pharmacy workspace is already registered, select it below to send a membership request to your supervisor/owner.
            </p>

            {loadingPharmacies ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted" />
              </div>
            ) : pharmacies.length === 0 ? (
              <div className="bg-white border border-border border-dashed rounded-xl p-4 text-center text-xs text-muted font-medium">
                No active workspaces found. Please ask your pharmacy manager to create one first.
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-muted mb-1.5">
                    Select Pharmacy
                  </label>
                  <select
                    value={selectedPharmacyId}
                    onChange={(e) => setSelectedPharmacyId(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm cursor-pointer font-medium appearance-none"
                  >
                    {pharmacies.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submittingJoin || submittingCreate}
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-interactive hover:opacity-90 text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingJoin ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      <span>Request Join</span>
                      <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
