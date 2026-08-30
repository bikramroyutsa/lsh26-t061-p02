import { Medicine } from '@/types/medicine';
import { getDaysRemaining, parseLocalDate, getTodayLocal } from './expiry';

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
      return '≤30 Days';
    case 'expiring90':
      return '31–90 Days';
    case 'safe':
      return 'Safe';
  }
}

/**
 * Calculates value for a single medicine: quantity * unitPriceBDT
 */
export function getMedicineValue(medicine: Medicine): number {
  return medicine.quantity * medicine.unitPriceBDT;
}

/**
 * Computes counts and sums for all active medicines, grouped by status.
 * Excludes returned medicines.
 */
export function calculateDashboardStats(medicines: Medicine[]): DashboardStats {
  const activeMedicines = medicines.filter((m) => !m.returned);

  const stats: DashboardStats = {
    expired:    { count: 0, totalQuantity: 0, totalValue: 0 },
    expiring30: { count: 0, totalQuantity: 0, totalValue: 0 },
    expiring90: { count: 0, totalQuantity: 0, totalValue: 0 },
    safe:       { count: 0, totalQuantity: 0, totalValue: 0 },
    immediateRiskValue: 0,
  };

  activeMedicines.forEach((m) => {
    const days = getDaysRemaining(m.expiryDate);
    const category = getExpiryCategory(days);
    const value = getMedicineValue(m);

    stats[category].count += 1;
    stats[category].totalQuantity += m.quantity;
    stats[category].totalValue += value;
  });

  // Immediate risk = expired + expiring within 30 days
  stats.immediateRiskValue =
    stats.expired.totalValue + stats.expiring30.totalValue;

  return stats;
}

export interface MedicineRiskInfo {
  medicine: Medicine;
  daysRemaining: number;
  category: ExpiryCategory;
  valueAtRisk: number;
}

/**
 * Returns medicines responsible for the largest financial risk
 * (Expired and Expiring within 30 Days), sorted descending by value.
 */
export function getHighestValueAtRisk(
  medicines: Medicine[],
  limit = 5
): MedicineRiskInfo[] {
  const activeMedicines = medicines.filter((m) => !m.returned);

  const riskList: MedicineRiskInfo[] = activeMedicines
    .map((m) => {
      const days = getDaysRemaining(m.expiryDate);
      const category = getExpiryCategory(days);
      const value = getMedicineValue(m);
      return { medicine: m, daysRemaining: days, category, valueAtRisk: value };
    })
    .filter(
      (item) =>
        item.category === 'expired' || item.category === 'expiring30'
    );

  return riskList
    .sort((a, b) => b.valueAtRisk - a.valueAtRisk)
    .slice(0, limit);
}

/**
 * Returns active medicines expiring within maxDays calendar days (0 to maxDays inclusive).
 * Sorted ascending by days remaining (most urgent first).
 */
export function getUrgentMedicines(
  medicines: Medicine[],
  maxDays = 2
): MedicineRiskInfo[] {
  const activeMedicines = medicines.filter((m) => !m.returned);

  return activeMedicines
    .map((m) => {
      const days = getDaysRemaining(m.expiryDate);
      const category = getExpiryCategory(days);
      const value = getMedicineValue(m);
      return { medicine: m, daysRemaining: days, category, valueAtRisk: value };
    })
    .filter((item) => item.daysRemaining >= 0 && item.daysRemaining <= maxDays)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

/**
 * Returns the total purchase value of active stock expiring in each of the
 * next N calendar months, for the 6-month forward chart.
 */
export function getMonthlyExpiryForecast(
  medicines: Medicine[],
  months = 6
): Array<{ month: string; value: number }> {
  const activeMedicines = medicines.filter((m) => !m.returned);
  const today = getTodayLocal();

  return Array.from({ length: months }, (_, i) => {
    // i+1 so we start from next month, not the current month
    const d = new Date(today.getFullYear(), today.getMonth() + i + 1, 1);
    const yr = d.getFullYear();
    const mo = d.getMonth();

    const value = activeMedicines
      .filter((m) => {
        const exp = parseLocalDate(m.expiryDate);
        return exp.getFullYear() === yr && exp.getMonth() === mo;
      })
      .reduce((sum, m) => sum + getMedicineValue(m), 0);

    return {
      month: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
      value: Math.round(value),
    };
  });
}
