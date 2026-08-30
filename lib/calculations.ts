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
      return '≤30 Days';
    case 'expiring90':
      return '31–90 Days';
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
    expired:    { count: 0, totalQuantity: 0, totalValue: 0 },
    expiring30: { count: 0, totalQuantity: 0, totalValue: 0 },
    expiring90: { count: 0, totalQuantity: 0, totalValue: 0 },
    safe:       { count: 0, totalQuantity: 0, totalValue: 0 },
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
      const days = getDaysRemaining(getMedicineExpiry(m));
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

export type LossIntervalKey = 'expired' | '0-7' | '8-14' | '15-21' | '22-28' | 'safe28';

export interface IntervalStats {
  key: LossIntervalKey;
  label: string;
  description: string;
  count: number;
  totalQuantity: number;
  totalValue: number;
  items: MedicineRiskInfo[];
}

export interface ExpiryLossBreakdown {
  alreadyExpired: IntervalStats;
  toExpireIntervals: IntervalStats[];
  totalToLose28Days: number;
  totalAlreadyExpiredLoss: number;
}

export function getLossIntervalKey(daysRemaining: number): LossIntervalKey {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= 7) return '0-7';
  if (daysRemaining <= 14) return '8-14';
  if (daysRemaining <= 21) return '15-21';
  if (daysRemaining <= 28) return '22-28';
  return 'safe28';
}

export function calculateExpiryLossBreakdown(medicines: Medicine[]): ExpiryLossBreakdown {
  const activeMedicines = medicines.filter((m) => !m.returned);

  const alreadyExpired: IntervalStats = {
    key: 'expired',
    label: 'Already Expired',
    description: 'Realized Financial Loss (Past Expiry)',
    count: 0,
    totalQuantity: 0,
    totalValue: 0,
    items: [],
  };

  const toExpireMap: Record<'0-7' | '8-14' | '15-21' | '22-28', IntervalStats> = {
    '0-7': {
      key: '0-7',
      label: '0–7 Days',
      description: 'Expiring in 0 to 7 days',
      count: 0,
      totalQuantity: 0,
      totalValue: 0,
      items: [],
    },
    '8-14': {
      key: '8-14',
      label: '8–14 Days',
      description: 'Expiring in 8 to 14 days',
      count: 0,
      totalQuantity: 0,
      totalValue: 0,
      items: [],
    },
    '15-21': {
      key: '15-21',
      label: '15–21 Days',
      description: 'Expiring in 15 to 21 days',
      count: 0,
      totalQuantity: 0,
      totalValue: 0,
      items: [],
    },
    '22-28': {
      key: '22-28',
      label: '22–28 Days',
      description: 'Expiring in 22 to 28 days',
      count: 0,
      totalQuantity: 0,
      totalValue: 0,
      items: [],
    },
  };

  activeMedicines.forEach((m) => {
    const days = getDaysRemaining(getMedicineExpiry(m));
    const category = getExpiryCategory(days);
    const value = getMedicineValue(m);
    const riskInfo: MedicineRiskInfo = { medicine: m, daysRemaining: days, category, valueAtRisk: value };
    const intervalKey = getLossIntervalKey(days);

    if (intervalKey === 'expired') {
      alreadyExpired.count += 1;
      alreadyExpired.totalQuantity += m.quantity;
      alreadyExpired.totalValue += value;
      alreadyExpired.items.push(riskInfo);
    } else if (intervalKey in toExpireMap) {
      const stats = toExpireMap[intervalKey as keyof typeof toExpireMap];
      stats.count += 1;
      stats.totalQuantity += m.quantity;
      stats.totalValue += value;
      stats.items.push(riskInfo);
    }
  });

  // Sort items in each category by urgency / days remaining ascending
  alreadyExpired.items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  Object.values(toExpireMap).forEach((stats) => {
    stats.items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  });

  const toExpireIntervals = [
    toExpireMap['0-7'],
    toExpireMap['8-14'],
    toExpireMap['15-21'],
    toExpireMap['22-28'],
  ];

  const totalToLose28Days = toExpireIntervals.reduce((sum, item) => sum + item.totalValue, 0);

  return {
    alreadyExpired,
    toExpireIntervals,
    totalToLose28Days,
    totalAlreadyExpiredLoss: alreadyExpired.totalValue,
  };
}

