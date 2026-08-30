import { Medicine } from '@/types/medicine';
import { generateSampleData } from './data';

const STORAGE_KEY = 'khulna_pharmacy_expiry_medicines';

/**
 * Retrieves medicines from localStorage.
 * If empty, seeds localStorage with the initial 42 sample medicines and returns them.
 */
export function getMedicinesFromStorage(): Medicine[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse medicines from storage', e);
    }
  }

  // Fallback / Seed first time
  const sample = generateSampleData();
  saveMedicinesToStorage(sample);
  return sample;
}

/**
 * Saves the current list of medicines to localStorage.
 */
export function saveMedicinesToStorage(medicines: Medicine[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
}

/**
 * Resets storage back to default sample medicines.
 */
export function resetMedicinesStorage(): Medicine[] {
  if (typeof window === 'undefined') return [];
  const sample = generateSampleData();
  saveMedicinesToStorage(sample);
  return sample;
}
