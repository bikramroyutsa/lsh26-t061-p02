import { Medicine } from '@/types/medicine';
import { getDaysRemaining } from './expiry';

export interface CategoryStats {
  count: number;
  totalQuantity: number;
  totalValue: number;
}

export interface DashboardStats {
  expired: CategoryStats;
  expiring30: CategoryStats;
  expiring90: CategoryStats;
  safe: CategoryStats;
  immediateRiskValue: number; // expired.totalValue + expiring30.totalValue
}

export type ExpiryCategory = 'expired' | 'expiring30' | 'expiring90' | 'safe';

/**
 * Safely extracts the medicine price, supporting both camelCase and snake_case schemas.
 */
export function getMedicinePrice(m: Medicine): number {
  if (m.unitPriceBDT !== undefined && !isNaN(m.unitPriceBDT)) return m.unitPriceBDT;
  if (m.unit_price_bdt !== undefined) return parseFloat(String(m.unit_price_bdt)) || 0;
  return 0;
}

/**
 * Safely extracts the expiry date, supporting both camelCase and snake_case schemas.
 */
export function getMedicineExpiry(m: Medicine): string {
  return m.expiryDate || m.expiry || '';
}

/**
 * Returns the dynamic category based on remaining days.
 * - Expired: < 0 days
 * - Expiring within 30 days: 0 to 30 days inclusive
 * - Expiring within 90 days: 31 to 90 days inclusive
 * - Safe: > 90 days
 */
export function getExpiryCategory(daysRemaining: number): ExpiryCategory {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 30) return 'expiring30';
  if (daysRemaining <= 90) return 'expiring90';
  return 'safe';
}

/**
 * Returns user-friendly badge names for the categories.
 */
export function getCategoryLabel(category: ExpiryCategory): string {
  switch (category) {
    case 'expired':
      return 'Expired';
    case 'expiring30':
      return 'Expiring ≤30 Days';
    case 'expiring90':
      return 'Expiring 31–90 Days';
    case 'safe':
      return 'Safe';
  }
}

/**
 * Calculates value for a single medicine: quantity * unitPriceBDT (or unit_price_bdt)
 */
export function getMedicineValue(medicine: Medicine): number {
  return medicine.quantity * getMedicinePrice(medicine);
}

/**
 * Computes counts and sums for all active medicines, grouped by status.
 * Excludes returned medicines.
 */
export function calculateDashboardStats(medicines: Medicine[]): DashboardStats {
  const activeMedicines = medicines.filter((m) => !m.returned);

  const stats: DashboardStats = {
    expired: { count: 0, totalQuantity: 0, totalValue: 0 },
    expiring30: { count: 0, totalQuantity: 0, totalValue: 0 },
    expiring90: { count: 0, totalQuantity: 0, totalValue: 0 },
    safe: { count: 0, totalQuantity: 0, totalValue: 0 },
    immediateRiskValue: 0,
  };

  activeMedicines.forEach((m) => {
    const days = getDaysRemaining(getMedicineExpiry(m));
    const category = getExpiryCategory(days);
    const value = getMedicineValue(m);

    stats[category].count += 1;
    stats[category].totalQuantity += m.quantity;
    stats[category].totalValue += value;
  });

  // Immediate risk is defined as Expired Value + Expiring within 30 days Value
  stats.immediateRiskValue = stats.expired.totalValue + stats.expiring30.totalValue;

  return stats;
}

export interface MedicineRiskInfo {
  medicine: Medicine;
  daysRemaining: number;
  category: ExpiryCategory;
  valueAtRisk: number;
}

/**
 * Returns medicines responsible for the largest financial risk (Expired and Expiring within 30 Days).
 * Sorted descending by value.
 */
export function getHighestValueAtRisk(medicines: Medicine[], limit = 5): MedicineRiskInfo[] {
  const activeMedicines = medicines.filter((m) => !m.returned);

  const riskList: MedicineRiskInfo[] = activeMedicines
    .map((m) => {
      const days = getDaysRemaining(getMedicineExpiry(m));
      const category = getExpiryCategory(days);
      const value = getMedicineValue(m);
      return { medicine: m, daysRemaining: days, category, valueAtRisk: value };
    })
    .filter((item) => item.category === 'expired' || item.category === 'expiring30');

  return riskList.sort((a, b) => b.valueAtRisk - a.valueAtRisk).slice(0, limit);
}
