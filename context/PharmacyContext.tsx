'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine } from '@/types/medicine';
import { supabase } from '@/lib/supabaseClient';
import { generateSampleData } from '@/lib/data';
import { useAuth } from './AuthContext';

interface PharmacyContextType {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'returned'>) => Promise<void>;
  returnMedicine: (id: string) => Promise<void>;
  unreturnMedicine: (id: string) => Promise<void>;
  sellMedicines: (items: { id: string; quantity: number }[]) => Promise<void>;
  resetData: () => Promise<void>;
  loading: boolean;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export function PharmacyProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  // Helper to map Supabase database row to the client-side Medicine interface
  const mapDbRowToMedicine = (row: any): Medicine => ({
    id: row.id,
    name: row.name,
    company: row.company,
    batch: row.batch,
    quantity: row.quantity,
    unitPriceBDT: Number(row.unit_price_bdt) || 0,
    unit_price_bdt: row.unit_price_bdt,
    expiryDate: row.expiry,
    expiry: row.expiry,
    returned: row.returned,
    returnedDate: row.returned_date || undefined,
    pharmacy_id: row.pharmacy_id || undefined,
  });

  const fetchMedicines = async () => {
    if (!profile || !profile.pharmacy_id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .eq('pharmacy_id', profile.pharmacy_id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setMedicines([]);
      } else {
        setMedicines(data.map(mapDbRowToMedicine));
      }
    } catch (e) {
      console.error('Error fetching/seeding medicines from Supabase:', e);
    } finally {
      setLoading(false);
    }
  };

  // Load database items whenever the authenticated user state or pharmacy changes
  useEffect(() => {
    if (user && profile?.pharmacy_id && profile?.status === 'approved') {
      fetchMedicines();
    } else {
      setMedicines([]);
      setLoading(false);
    }
  }, [user, profile]);

  const addMedicine = async (newMed: Omit<Medicine, 'id' | 'returned'>) => {
    if (!profile || !profile.pharmacy_id) return;

    const id = `med-${Math.random().toString(36).substring(2, 9)}`;
    const medicine: Medicine = {
      ...newMed,
      id,
      returned: false,
      pharmacy_id: profile.pharmacy_id,
    };

    try {
      const { error } = await supabase.from('medicines').insert([
        {
          id,
          name: newMed.name,
          company: newMed.company,
          batch: newMed.batch,
          quantity: newMed.quantity,
          unit_price_bdt: newMed.unitPriceBDT,
          expiry: newMed.expiryDate,
          returned: false,
          returned_date: null,
          pharmacy_id: profile.pharmacy_id,
        },
      ]);
      if (error) throw error;

      // Update client-side state
      setMedicines((prev) => [...prev, medicine]);
    } catch (e) {
      console.error('Error adding medicine to Supabase:', e);
      alert('Failed to save medicine to database.');
    }
  };

  const returnMedicine = async (id: string) => {
    if (!profile || !profile.pharmacy_id) return;

    const returnedDate = new Date().toISOString().split('T')[0];
    try {
      const { error } = await supabase
        .from('medicines')
        .update({
          returned: true,
          returned_date: returnedDate,
        })
        .eq('id', id)
        .eq('pharmacy_id', profile.pharmacy_id); // check scope

      if (error) throw error;

      // Update client-side state
      setMedicines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, returned: true, returnedDate } : m))
      );
    } catch (e) {
      console.error('Error updating returned medicine in Supabase:', e);
      alert('Failed to return medicine to distributor.');
    }
  };

  const unreturnMedicine = async (id: string) => {
    if (!profile || !profile.pharmacy_id) return;

    try {
      const { error } = await supabase
        .from('medicines')
        .update({
          returned: false,
          returned_date: null,
        })
        .eq('id', id)
        .eq('pharmacy_id', profile.pharmacy_id);

      if (error) throw error;

      // Update client-side state
      setMedicines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, returned: false, returnedDate: undefined } : m))
      );
    } catch (e) {
      console.error('Error undoing returned medicine in Supabase:', e);
      alert('Failed to undo return.');
    }
  };

  const sellMedicines = async (items: { id: string; quantity: number }[]) => {
    if (!profile || !profile.pharmacy_id || items.length === 0) return;

    try {
      for (const item of items) {
        const currentMed = medicines.find((m) => m.id === item.id);
        if (!currentMed) continue;
        const newQty = Math.max(0, currentMed.quantity - item.quantity);

        const { error } = await supabase
          .from('medicines')
          .update({ quantity: newQty })
          .eq('id', item.id)
          .eq('pharmacy_id', profile.pharmacy_id);

        if (error) throw error;
      }

      // Update client-side state
      setMedicines((prev) =>
        prev.map((m) => {
          const soldItem = items.find((i) => i.id === m.id);
          if (soldItem) {
            return {
              ...m,
              quantity: Math.max(0, m.quantity - soldItem.quantity),
            };
          }
          return m;
        })
      );
    } catch (e) {
      console.error('Error completing sale in Supabase:', e);
      alert('Failed to update inventory for sale.');
      throw e;
    }
  };

  const resetData = async () => {
    if (!profile || !profile.pharmacy_id) return;

    try {
      setLoading(true);

      // Clean existing records scoped to this pharmacy from database
      const { error: deleteError } = await supabase
        .from('medicines')
        .delete()
        .eq('pharmacy_id', profile.pharmacy_id);
      if (deleteError) throw deleteError;

      // Seed default sample data back in
      const sampleData = generateSampleData().map((m) => ({
        ...m,
        id: `${m.id}-${profile.pharmacy_id!.substring(0, 8)}`,
        pharmacy_id: profile.pharmacy_id!,
      }));
      const rowsToInsert = sampleData.map((m) => ({
        id: m.id,
        name: m.name,
        company: m.company,
        batch: m.batch,
        quantity: m.quantity,
        unit_price_bdt: m.unitPriceBDT,
        expiry: m.expiryDate,
        returned: m.returned || false,
        returned_date: m.returnedDate || null,
        pharmacy_id: profile.pharmacy_id,
      }));

      const { error: insertError } = await supabase.from('medicines').insert(rowsToInsert);
      if (insertError) throw insertError;

      setMedicines(sampleData);
    } catch (e) {
      console.error('Error resetting database in Supabase:', e);
      alert('Failed to reset stock data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        addMedicine,
        returnMedicine,
        unreturnMedicine,
        sellMedicines,
        resetData,
        loading,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
}
