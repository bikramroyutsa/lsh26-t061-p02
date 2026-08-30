'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Activity, Mail, Lock, Loader2, Leaf } from 'lucide-react';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        // With "Confirm email" disabled, user is automatically logged in.
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="clay-card w-full max-w-md p-8 space-y-8 animate-fade-up">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-fg text-primary p-3 rounded-full shadow-md">
            <Leaf className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-fg mt-5 tracking-tight leading-tight">
            MediShelf
          </h2>
          <p className="text-[11px] text-muted font-mono tracking-widest uppercase mt-2">
            Pharmacy Portal Login
          </p>
        </div>

        {/* Demo Callout */}
        <div className="bg-safe-bg/60 border border-safe-border text-safe px-5 py-4 rounded-2xl">
          <p className="text-xs font-medium leading-relaxed">
            Welcome! Explore MediShelf by creating an account with any email, or sign in instantly with our demo account:
          </p>
          <div className="mt-3 font-mono text-[11px] bg-white px-3 py-2 rounded-xl border border-safe-border/50 text-fg shadow-sm flex flex-col gap-1 select-all cursor-text">
            <span>Email: <span className="font-bold text-interactive">abc@cbd.com</span></span>
            <span>Password: <span className="font-bold text-interactive">123456</span></span>
          </div>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="bg-expired-bg border border-expired-border text-expired text-xs sm:text-sm px-4 py-3 rounded-xl font-medium animate-in fade-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-widest text-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pharmacist@khulnapharmacy.com"
                className="block w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-medium uppercase tracking-widest text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 shadow-sm"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white font-semibold text-sm rounded-full shadow-md hover:shadow-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : isSignUp ? (
              'Create Workspace Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-xs text-muted hover:text-fg font-medium cursor-pointer transition-colors"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
