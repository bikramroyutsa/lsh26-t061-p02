'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthScreen from '@/components/auth/AuthScreen';
import Onboarding from '@/components/auth/Onboarding';
import LandingPage from '@/components/landing/LandingPage';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import ConfirmationModal from '../ui/ConfirmationModal';

export default function AppAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, profile, pharmacy, loading, signOut, refreshProfile } = useAuth();
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted font-medium text-sm animate-pulse">Verifying security session...</span>
      </div>
    );
  }

  // 1. Not Authenticated
  if (!user) {
    if (showLogin) {
      return <AuthScreen />;
    }
    return <LandingPage onLogin={() => setShowLogin(true)} />;
  }

  // 2. Authenticated but no pharmacy selected/created yet
  if (!profile || !profile.pharmacy_id) {
    return <Onboarding />;
  }

  // 3. Requested a pharmacy but request is pending owner approval
  if (profile.status === 'pending') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="clay-card max-w-md w-full p-8 space-y-6 text-center animate-fade-up">
          <div className="mx-auto bg-interactive/10 text-interactive p-4 rounded-full w-fit">
            <ShieldAlert className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-fg tracking-tight">
              Access Request Pending
            </h2>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Your request to join <strong className="text-fg font-bold">{pharmacy?.name || 'the workspace'}</strong> is waiting for approval from the pharmacy owner.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleCancelRequest}
              disabled={cancellingRequest}
              className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-white border border-border hover:border-primary/50 hover:bg-safe-bg text-fg font-semibold text-sm rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {cancellingRequest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                  <span>Choose Another Pharmacy</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsSignOutOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-white border border-expired-border hover:bg-expired-bg text-expired font-semibold text-sm rounded-full transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
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
