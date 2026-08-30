-- 1. Create public.pharmacies table
CREATE TABLE IF NOT EXISTS public.pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Create public.profiles table (links users to roles and status within a tenant)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy_id uuid REFERENCES public.pharmacies(id) ON DELETE SET NULL,
  role text CHECK (role IN ('owner', 'employee')),
  status text CHECK (status IN ('approved', 'pending')) DEFAULT 'pending' NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Add pharmacy_id reference to the medicines table
ALTER TABLE public.medicines ADD COLUMN IF NOT EXISTS pharmacy_id uuid REFERENCES public.pharmacies(id) ON DELETE CASCADE;

-- 4. Enable Row Level Security (RLS) on new tables
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function to determine if active user is a pharmacy owner
CREATE OR REPLACE FUNCTION public.is_pharmacy_owner(p_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pharmacies
    WHERE pharmacies.id = p_id AND pharmacies.owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies for public.pharmacies
CREATE POLICY "Allow authenticated read pharmacies" ON public.pharmacies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated insert pharmacies" ON public.pharmacies
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Allow owner update pharmacies" ON public.pharmacies
  FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- 7. RLS Policies for public.profiles
CREATE POLICY "Allow authenticated read profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users and owners update profiles" ON public.profiles
  FOR UPDATE
  USING (
    id = auth.uid() 
    OR public.is_pharmacy_owner(pharmacy_id)
  )
  WITH CHECK (
    id = auth.uid()
    OR public.is_pharmacy_owner(pharmacy_id)
  );

-- 8. Reset medicines RLS Policies to enforce tenant scoping
DROP POLICY IF EXISTS "Allow public select access" ON public.medicines;
DROP POLICY IF EXISTS "Allow public insert access" ON public.medicines;
DROP POLICY IF EXISTS "Allow public update access" ON public.medicines;
DROP POLICY IF EXISTS "Allow public delete access" ON public.medicines;

CREATE POLICY "Allow medicines access for approved members" ON public.medicines
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.pharmacy_id = medicines.pharmacy_id
        AND profiles.status = 'approved'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.pharmacy_id = medicines.pharmacy_id
        AND profiles.status = 'approved'
    )
  );

-- 9. Automated Trigger Function to create user profiles upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, status)
  VALUES (new.id, new.email, 'employee', 'pending');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
