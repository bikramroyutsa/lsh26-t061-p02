'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthScreen from '@/components/auth/AuthScreen';
import { Loader2 } from 'lucide-react';

export default function AppAuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="text-slate-500 font-medium text-sm">Verifying security session...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
