'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medicine } from '@/types/medicine';
import { getMedicinesFromStorage, saveMedicinesToStorage, resetMedicinesStorage } from '@/lib/storage';

interface PharmacyContextType {
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id' | 'returned'>) => void;
  returnMedicine: (id: string) => void;
  resetData: () => void;
  loading: boolean;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export function PharmacyProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage only on client mount to avoid hydration mismatch
  useEffect(() => {
    setMedicines(getMedicinesFromStorage());
    setLoading(false);
  }, []);

  const addMedicine = (newMed: Omit<Medicine, 'id' | 'returned'>) => {
    const medicine: Medicine = {
      ...newMed,
      id: `med-${Math.random().toString(36).substring(2, 9)}`,
      returned: false,
    };
    const updated = [...medicines, medicine];
    setMedicines(updated);
    saveMedicinesToStorage(updated);
  };

  const returnMedicine = (id: string) => {
    const updated = medicines.map((m) => {
      if (m.id === id) {
        return {
          ...m,
          returned: true,
          returnedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        };
      }
      return m;
    });
    setMedicines(updated);
    saveMedicinesToStorage(updated);
  };

  const resetData = () => {
    const reset = resetMedicinesStorage();
    setMedicines(reset);
    saveMedicinesToStorage(reset);
  };

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        addMedicine,
        returnMedicine,
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
