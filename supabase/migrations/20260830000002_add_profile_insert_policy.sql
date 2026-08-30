-- Allow users to insert their own profile row (required for client-side onboarding upserts)
CREATE POLICY "Allow users insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
