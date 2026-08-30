export interface Medicine {
  id: string;
  name: string;
  company: string;
  batch: string;
  quantity: number;
  unitPriceBDT: number;
  expiryDate: string; // YYYY-MM-DD format
  returned?: boolean;
  returnedDate?: string; // YYYY-MM-DD format
}
