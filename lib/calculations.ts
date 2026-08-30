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
  immediateRiskValue: number; // Kept for backward compatibility (expired.totalValue + expiring30.totalValue)
  possibleLoss28?: number;    // Total possible loss for stock expiring in next 0-28 days
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
  valueAtRisk: number; // Potential financial loss (quantity * unitPrice)
}

/**
 * Structure for weekly upcoming expiry risk windows.
 */
export interface WeeklyRiskBucket {
  id: '0-7' | '8-14' | '14-21' | '22-28';
  label: string;
  subtitle: string;
  minDays: number;
  maxDays: number;
  count: number;
  totalQuantity: number;
  possibleLoss: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'moderate';
  accentColor: string;
  badgeBg: string;
  medicines: MedicineRiskInfo[];
}

export interface WeeklyRiskAnalysis {
  buckets: WeeklyRiskBucket[];
  totalPossibleLoss: number;
  totalExpiringCount: number;
  totalExpiringUnits: number;
  allExpiringMedicines: MedicineRiskInfo[];
  expiredLoss: number;
  expiredCount: number;
  expiredUnits: number;
  expiredMedicines: MedicineRiskInfo[];
}

/**
 * Computes granular weekly risk buckets (0-7d, 8-14d, 14-21d, 22-28d) and strictly
 * separates realized Expired Loss from upcoming possible loss.
 */
export function getWeeklyRiskBuckets(medicines: Medicine[]): WeeklyRiskAnalysis {
  const activeMedicines = medicines.filter((m) => !m.returned);

  const bucketDefs: Omit<WeeklyRiskBucket, 'count' | 'totalQuantity' | 'possibleLoss' | 'medicines'>[] = [
    {
      id: '0-7',
      label: '0–7 Days',
      subtitle: 'Immediate critical risk',
      minDays: 0,
      maxDays: 7,
      riskLevel: 'critical',
      accentColor: 'var(--expired-color)',
      badgeBg: 'var(--expired-bg)',
    },
    {
      id: '8-14',
      label: '8–14 Days',
      subtitle: 'Week 2 upcoming risk',
      minDays: 8,
      maxDays: 14,
      riskLevel: 'high',
      accentColor: 'var(--warn-color)',
      badgeBg: 'var(--warn-bg)',
    },
    {
      id: '14-21',
      label: '14–21 Days',
      subtitle: 'Week 3 upcoming risk',
      minDays: 15,
      maxDays: 21,
      riskLevel: 'medium',
      accentColor: '#D97706',
      badgeBg: '#FFFBEB',
    },
    {
      id: '22-28',
      label: '22–28 Days',
      subtitle: 'Week 4 upcoming risk',
      minDays: 22,
      maxDays: 28,
      riskLevel: 'moderate',
      accentColor: 'var(--watch-color)',
      badgeBg: 'var(--watch-bg)',
    },
  ];

  const buckets: WeeklyRiskBucket[] = bucketDefs.map((def) => ({
    ...def,
    count: 0,
    totalQuantity: 0,
    possibleLoss: 0,
    medicines: [],
  }));

  const expiredMedicines: MedicineRiskInfo[] = [];
  const allExpiringMedicines: MedicineRiskInfo[] = [];

  let expiredLoss = 0;
  let expiredCount = 0;
  let expiredUnits = 0;

  activeMedicines.forEach((m) => {
    const days = getDaysRemaining(getMedicineExpiry(m));
    const value = getMedicineValue(m);
    const category = getExpiryCategory(days);

    const info: MedicineRiskInfo = {
      medicine: m,
      daysRemaining: days,
      category,
      valueAtRisk: value,
    };

    if (days < 0) {
      // Strictly Expired Stock (Realized Loss)
      expiredLoss += value;
      expiredCount += 1;
      expiredUnits += m.quantity;
      expiredMedicines.push(info);
    } else if (days >= 0 && days <= 28) {
      // Upcoming 0-28 Days Risk (Possible Loss)
      allExpiringMedicines.push(info);

      for (const bucket of buckets) {
        if (days >= bucket.minDays && days <= bucket.maxDays) {
          bucket.count += 1;
          bucket.totalQuantity += m.quantity;
          bucket.possibleLoss += value;
          bucket.medicines.push(info);
          break;
        }
      }
    }
  });

  // Sort buckets' medicine lists: fewest days remaining first, then highest possible loss
  buckets.forEach((b) => {
    b.medicines.sort((a, b) => a.daysRemaining - b.daysRemaining || b.valueAtRisk - a.valueAtRisk);
  });

  // Sort overall lists
  allExpiringMedicines.sort((a, b) => a.daysRemaining - b.daysRemaining || b.valueAtRisk - a.valueAtRisk);
  expiredMedicines.sort((a, b) => a.daysRemaining - b.daysRemaining || b.valueAtRisk - a.valueAtRisk);

  const totalPossibleLoss = buckets.reduce((sum, b) => sum + b.possibleLoss, 0);
  const totalExpiringCount = allExpiringMedicines.length;
  const totalExpiringUnits = allExpiringMedicines.reduce((sum, item) => sum + item.medicine.quantity, 0);

  return {
    buckets,
    totalPossibleLoss,
    totalExpiringCount,
    totalExpiringUnits,
    allExpiringMedicines,
    expiredLoss,
    expiredCount,
    expiredUnits,
    expiredMedicines,
  };
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

/**
 * Returns medicines that are expiring very soon (e.g. within 2 days).
 */
export function getUrgentMedicines(medicines: Medicine[], daysThreshold = 2): MedicineRiskInfo[] {
  const activeMedicines = medicines.filter((m) => !m.returned);

  return activeMedicines
    .map((m) => {
      const days = getDaysRemaining(getMedicineExpiry(m));
      const category = getExpiryCategory(days);
      const value = getMedicineValue(m);
      return { medicine: m, daysRemaining: days, category, valueAtRisk: value };
    })
    .filter((item) => item.daysRemaining >= 0 && item.daysRemaining <= daysThreshold)
    .sort((a, b) => a.daysRemaining - b.daysRemaining || b.valueAtRisk - a.valueAtRisk);
}

/**
 * Computes value expiring per calendar month for the next N months.
 */
export function getMonthlyExpiryForecast(
  medicines: Medicine[],
  monthsAhead = 6
): Array<{ month: string; value: number }> {
  const activeMedicines = medicines.filter((m) => !m.returned);
  const today = getTodayLocal();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const forecast: Array<{ month: string; value: number; year: number; monthIdx: number }> = [];

  for (let i = 0; i < monthsAhead; i++) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    forecast.push({
      month: `${monthNames[m]} '${String(y).slice(-2)}`,
      value: 0,
      year: y,
      monthIdx: m,
    });
  }

  activeMedicines.forEach((med) => {
    const dateStr = getMedicineExpiry(med);
    if (!dateStr) return;
    const expiry = parseLocalDate(dateStr);
    const ey = expiry.getFullYear();
    const em = expiry.getMonth();

    const target = forecast.find((f) => f.year === ey && f.monthIdx === em);
    if (target) {
      target.value += getMedicineValue(med);
    }
  });

  return forecast.map(({ month, value }) => ({ month, value: Math.round(value) }));
}
