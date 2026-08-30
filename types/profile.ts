export interface Profile {
  id: string;
  pharmacy_id: string | null;
  role: 'owner' | 'employee' | null;
  status: 'approved' | 'pending';
  email: string;
  created_at: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}
