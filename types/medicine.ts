export interface Medicine {
  id: string;
  name: string;
  company: string;
  batch: string;
  quantity: number;
  
  // Prompt specification
  unitPriceBDT: number;
  expiryDate: string; // YYYY-MM-DD

  // Fallback to support the public test case JSON schema
  unit_price_bdt?: string | number;
  expiry?: string; // YYYY-MM-DD

  returned?: boolean;
  returnedDate?: string; // YYYY-MM-DD
  pharmacy_id?: string;
}
