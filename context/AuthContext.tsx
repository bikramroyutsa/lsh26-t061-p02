'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Profile, Pharmacy } from '@/types/profile';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  pharmacy: Pharmacy | null;
  ownedPharmacies: Pharmacy[];
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchPharmacy: (pharmacyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [ownedPharmacies, setOwnedPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessionDetails = async (currUser: User | null) => {
    if (currUser) {
      try {
        // Fetch user profile from the database
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currUser.id)
          .maybeSingle();

        if (prof) {
          const mappedProf: Profile = {
            id: prof.id,
            pharmacy_id: prof.pharmacy_id,
            role: prof.role as any,
            status: prof.status as any,
            email: prof.email,
            created_at: prof.created_at,
          };
          setProfile(mappedProf);

          if (prof.pharmacy_id) {
            const { data: pharm } = await supabase
              .from('pharmacies')
              .select('*')
              .eq('id', prof.pharmacy_id)
              .maybeSingle();

            setPharmacy(pharm);
          } else {
            setPharmacy(null);
          }
        } else {
          setProfile(null);
          setPharmacy(null);
        }

        // Fetch all pharmacies owned by this user
        const { data: owned } = await supabase
          .from('pharmacies')
          .select('*')
          .eq('owner_id', currUser.id)
          .order('name', { ascending: true });

        setOwnedPharmacies(owned || []);
      } catch (e) {
        console.error('Error loading profile details:', e);
      }
    } else {
      setProfile(null);
      setPharmacy(null);
      setOwnedPharmacies([]);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadSessionDetails(session.user);
      }
      setLoading(false);
    });

    // Listen to changes in authentication state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setLoading(true);
        await loadSessionDetails(newSession.user);
      } else {
        setProfile(null);
        setPharmacy(null);
        setOwnedPharmacies([]);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await loadSessionDetails(user);
    }
  };

  const switchPharmacy = async (pharmacyId: string) => {
    if (!user) return;
    try {
      setLoading(true);
      // Determine role: if they own it, they are the owner. Otherwise, employee.
      const isOwner = ownedPharmacies.some((p) => p.id === pharmacyId);
      const targetRole = isOwner ? 'owner' : 'employee';

      const { error } = await supabase
        .from('profiles')
        .update({
          pharmacy_id: pharmacyId,
          role: targetRole,
          status: 'approved',
        })
        .eq('id', user.id);

      if (error) throw error;
      await loadSessionDetails(user);
    } catch (e) {
      console.error('Error switching pharmacy:', e);
      alert('Failed to switch pharmacy workspace.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Failed to sign out', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        pharmacy,
        ownedPharmacies,
        loading,
        signOut,
        refreshProfile,
        switchPharmacy,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
