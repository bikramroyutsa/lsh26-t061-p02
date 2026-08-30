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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-8">
        {/* Onboarding Header */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-indigo-500 text-white p-3 rounded-2xl shadow-md">
            <Store className="h-7 w-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-4 tracking-tight">
            Select Your Pharmacy Workspace
          </h2>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Create a workspace as a pharmacy owner or request access to join an existing pharmacy team.
          </p>
        </div>

        {/* Error Messaging */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs sm:text-sm px-4 py-3 rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Owner: Create Option */}
          <div className="space-y-4 pt-4 md:pt-0">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800 text-base">Create a Workspace</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you own the store, register a new pharmacy workspace. You will instantly become its system administrator and can approve employees.
            </p>

            <form onSubmit={handleCreate} className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Pharmacy Name
                </label>
                <input
                  type="text"
                  value={newPharmacyName}
                  onChange={(e) => setNewPharmacyName(e.target.value)}
                  placeholder="e.g. Khulna Pharmacy"
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingCreate || submittingJoin}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {submittingCreate ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Create Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Employee: Join Option */}
          <div className="space-y-4 pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-sky-500" />
              <h3 className="font-bold text-slate-800 text-base">Join a Workspace</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If your pharmacy workspace is already registered, select it below to send a membership request to your supervisor/owner.
            </p>

            {loadingPharmacies ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : pharmacies.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center text-xs text-slate-400 font-medium">
                No active workspaces found. Please ask your pharmacy manager to create one first.
              </div>
            ) : (
              <form onSubmit={handleJoin} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                    Select Pharmacy
                  </label>
                  <select
                    value={selectedPharmacyId}
                    onChange={(e) => setSelectedPharmacyId(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors cursor-pointer font-semibold text-slate-700"
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
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer disabled:bg-sky-400 disabled:cursor-not-allowed"
                >
                  {submittingJoin ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      <span>Request Join</span>
                      <ArrowRight className="h-4 w-4" />
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
