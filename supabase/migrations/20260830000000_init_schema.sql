-- Create the medicines table
CREATE TABLE IF NOT EXISTS public.medicines (
  id text PRIMARY KEY,
  name text NOT NULL,
  company text NOT NULL,
  batch text NOT NULL,
  quantity integer NOT NULL,
  unit_price_bdt numeric(12, 4) NOT NULL, -- high precision price matching decimal/float
  expiry date NOT NULL, -- Date field for standard expiry formats
  returned boolean DEFAULT false NOT NULL,
  returned_date date, -- Date field for return actions
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (as no auth is required by design)
CREATE POLICY "Allow public select access" ON public.medicines
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.medicines
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.medicines
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access" ON public.medicines
  FOR DELETE USING (true);
