-- ================================================================
-- PRELEAD PROPERTIES — Row Level Security Policies  v1.0
-- Run after 001_initial_schema.sql
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── KYC Profiles ──────────────────────────────────────────────
CREATE POLICY "Users can view own KYC"
  ON public.kyc_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC"
  ON public.kyc_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC"
  ON public.kyc_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ── Property Listings (public read, admin write) ──────────────
CREATE POLICY "Listings are publicly readable"
  ON public.property_listings FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can insert listings"
  ON public.property_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ── Saved Properties ──────────────────────────────────────────
CREATE POLICY "Users manage own saved properties"
  ON public.saved_properties FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Enquiries ─────────────────────────────────────────────────
CREATE POLICY "Users manage own enquiries"
  ON public.enquiries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Viewings ──────────────────────────────────────────────────
CREATE POLICY "Users manage own viewings"
  ON public.viewings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Trigger: Create profile on signup ────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, role, state, organization)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'first_name'),
    (NEW.raw_user_meta_data->>'last_name'),
    (NEW.raw_user_meta_data->>'phone'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    (NEW.raw_user_meta_data->>'state'),
    (NEW.raw_user_meta_data->>'organization')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
