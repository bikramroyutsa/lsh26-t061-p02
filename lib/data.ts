import { Medicine } from '@/types/medicine';

/**
 * Helper to get a date string (YYYY-MM-DD) shifted by a certain number of days from today.
 */
export function getTodayOffsetString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function generateSampleData(): Medicine[] {
  const brands = [
    { name: 'Napa 500mg', company: 'Beximco' },
    { name: 'Seclo 20mg', company: 'Square' },
    { name: 'Fexo 120mg', company: 'Renata' },
    { name: 'Amlovas 5mg', company: 'Aristopharma' },
    { name: 'Monas 10mg', company: 'Acme' },
    { name: 'Rivotril 0.5mg', company: 'Roche / Radiant' },
    { name: 'Histacin 10mg', company: 'Sanofi / ACI' },
    { name: 'Sergel 20mg', company: 'Healthcare' },
    { name: 'DP-Tone 50mg', company: 'Opsonin' },
    { name: 'Maxpro 20mg', company: 'Incepta' },
    { name: 'Alatrol 10mg', company: 'Square' },
    { name: 'Tofen 1mg', company: 'Beximco' },
    { name: 'Pantonic 20mg', company: 'Incepta' },
    { name: 'Xeldrin 100mg', company: 'Healthcare' },
    { name: 'Fenadin 120mg', company: 'Renata' },
    { name: 'Atova 10mg', company: 'Beximco' },
    { name: 'Bizoran 5/20', company: 'Square' },
    { name: 'Coralcal-D', company: 'Radiant' },
    { name: 'Ebutyl 400mg', company: 'Opsonin' },
    { name: 'Furo-40mg', company: 'ACI' },
  ];

  const items: Medicine[] = [];

  // 1. Expired Items (10 items)
  const expiredOffsets = [-5, -12, -28, -60, -90, -180, -2, -15, -8, -40];
  const expiredQuantities = [120, 80, 200, 50, 150, 60, 100, 300, 45, 90];
  const expiredPrices = [1.8, 5.0, 8.5, 6.0, 12.0, 15.0, 2.5, 4.0, 3.5, 9.0];

  for (let i = 0; i < 10; i++) {
    const brand = brands[i % brands.length];
    const expiryStr = getTodayOffsetString(expiredOffsets[i]);
    items.push({
      id: `exp-${i + 1}`,
      name: brand.name,
      company: brand.company,
      batch: `EX-${24000 + i}`,
      quantity: expiredQuantities[i],
      unitPriceBDT: expiredPrices[i],
      unit_price_bdt: expiredPrices[i].toFixed(2),
      expiryDate: expiryStr,
      expiry: expiryStr,
      returned: false,
    });
  }

  // 2. Expiring <= 30 Days (10 items)
  const soonOffsets = [0, 1, 5, 12, 18, 25, 29, 30, 10, 20];
  const soonQuantities = [250, 150, 100, 300, 80, 50, 120, 400, 75, 110];
  const soonPrices = [2.0, 4.8, 8.0, 3.5, 12.5, 18.0, 5.5, 2.2, 7.0, 10.0];

  for (let i = 0; i < 10; i++) {
    const brand = brands[(i + 3) % brands.length];
    const expiryStr = getTodayOffsetString(soonOffsets[i]);
    items.push({
      id: `soon-${i + 1}`,
      name: brand.name,
      company: brand.company,
      batch: `SN-${25000 + i}`,
      quantity: soonQuantities[i],
      unitPriceBDT: soonPrices[i],
      unit_price_bdt: soonPrices[i].toFixed(2),
      expiryDate: expiryStr,
      expiry: expiryStr,
      returned: false,
    });
  }

  // 3. Expiring 31-90 Days (10 items)
  const midOffsets = [31, 35, 45, 60, 75, 80, 89, 90, 50, 65];
  const midQuantities = [180, 140, 90, 220, 150, 60, 85, 310, 130, 70];
  const midPrices = [2.2, 5.0, 7.5, 4.0, 11.0, 16.5, 6.0, 2.5, 8.5, 12.0];

  for (let i = 0; i < 10; i++) {
    const brand = brands[(i + 7) % brands.length];
    const expiryStr = getTodayOffsetString(midOffsets[i]);
    items.push({
      id: `mid-${i + 1}`,
      name: brand.name,
      company: brand.company,
      batch: `MD-${26000 + i}`,
      quantity: midQuantities[i],
      unitPriceBDT: midPrices[i],
      unit_price_bdt: midPrices[i].toFixed(2),
      expiryDate: expiryStr,
      expiry: expiryStr,
      returned: false,
    });
  }

  // 4. Safe Items (12 items)
  const safeOffsets = [91, 100, 120, 150, 180, 240, 300, 365, 400, 500, 600, 730];
  const safeQuantities = [500, 200, 150, 350, 180, 90, 110, 600, 130, 80, 140, 250];
  const safePrices = [1.8, 5.2, 8.0, 3.8, 12.0, 15.0, 7.0, 2.0, 10.5, 14.0, 6.5, 4.5];

  for (let i = 0; i < 12; i++) {
    const brand = brands[(i + 11) % brands.length];
    const expiryStr = getTodayOffsetString(safeOffsets[i]);
    items.push({
      id: `safe-${i + 1}`,
      name: brand.name,
      company: brand.company,
      batch: `SF-${27000 + i}`,
      quantity: safeQuantities[i],
      unitPriceBDT: safePrices[i],
      unit_price_bdt: safePrices[i].toFixed(2),
      expiryDate: expiryStr,
      expiry: expiryStr,
      returned: false,
    });
  }

  return items;
}
