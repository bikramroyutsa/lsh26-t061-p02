'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthScreen from '@/components/auth/AuthScreen';
import Onboarding from '@/components/auth/Onboarding';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';

export default function AppAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, profile, pharmacy, loading, signOut, refreshProfile } = useAuth();
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const handleCancelRequest = async () => {
    if (!user) return;
    setCancellingRequest(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          pharmacy_id: null,
          role: 'employee',
          status: 'pending',
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
    } catch (e) {
      console.error('Error resetting pharmacy request:', e);
      alert('Failed to cancel request.');
    } finally {
      setCancellingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-slate-500 font-medium text-sm">Verifying security session...</span>
      </div>
    );
  }

  // 1. Not Authenticated
  if (!user) {
    return <AuthScreen />;
  }

  // 2. Authenticated but no pharmacy selected/created yet
  if (!profile || !profile.pharmacy_id) {
    return <Onboarding />;
  }

  // 3. Requested a pharmacy but request is pending owner approval
  if (profile.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6 text-center">
          <div className="mx-auto bg-amber-50 text-amber-500 p-4 rounded-2xl w-fit">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Access Request Pending
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Your request to join <strong className="text-slate-700 font-bold">{pharmacy?.name || 'the workspace'}</strong> is waiting for approval from the pharmacy owner.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-4">
            <button
              onClick={handleCancelRequest}
              disabled={cancellingRequest}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-lg transition-colors cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
            >
              {cancellingRequest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  <span>Choose Another Pharmacy</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsSignOutOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isSignOutOpen}
          title="Confirm Sign Out"
          message="Are you sure you want to log out of the Pharmacy Expiry Shelf Check portal?"
          confirmLabel="Sign Out"
          variant="info"
          onConfirm={() => {
            signOut();
            setIsSignOutOpen(false);
          }}
          onCancel={() => setIsSignOutOpen(false)}
        />
      </div>
    );
  }

  // 4. Authenticated & Approved
  return <>{children}</>;
}
