-- ================================================================
-- PRELEAD PROPERTIES — Initial Schema  v1.0
-- Run this first in your Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles (auto-created on signup) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT,
  last_name       TEXT,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  role            TEXT DEFAULT 'buyer' CHECK (role IN ('buyer','investor','agent','developer','admin')),
  state           TEXT,
  organization    TEXT,
  budget          TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── KYC Profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kyc_profiles (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Personal
  first_name            TEXT,
  middle_name           TEXT,
  last_name             TEXT,
  date_of_birth         DATE,
  gender                TEXT,
  nationality           TEXT,
  state_of_origin       TEXT,
  phone                 TEXT,
  occupation            TEXT,
  -- Address
  residential_state     TEXT,
  residential_city      TEXT,
  residential_address   TEXT,
  residential_landmark  TEXT,
  postal_code           TEXT,
  housing_status        TEXT,
  -- Identity
  id_type               TEXT,
  id_number             TEXT,
  id_front_url          TEXT,
  id_back_url           TEXT,
  -- Financial
  employment_type       TEXT,
  employer_name         TEXT,
  annual_income         TEXT,
  source_of_funds       TEXT,
  budget_range          TEXT,
  payment_preference    TEXT,
  proof_of_funds_url    TEXT,
  -- Preferences
  investment_purpose    TEXT,
  property_interests    TEXT,
  -- Status
  status                TEXT DEFAULT 'draft' CHECK (status IN ('draft','under_review','verified','rejected')),
  rejection_reason      TEXT,
  reviewed_by           UUID,
  reviewed_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Property Listings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.property_listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT CHECK (type IN ('residential','commercial','multipurpose','multinational','plaza','mooreland','industrial','land')),
  price         NUMERIC(18,2),
  price_label   TEXT,
  location      TEXT,
  state         TEXT,
  city          TEXT,
  address       TEXT,
  bedrooms      INTEGER,
  bathrooms     INTEGER,
  sqft          NUMERIC(12,2),
  floors        INTEGER,
  units         INTEGER,
  capacity      INTEGER,
  status        TEXT DEFAULT 'available' CHECK (status IN ('available','sold','pending','off-plan')),
  featured      BOOLEAN DEFAULT FALSE,
  images        TEXT[],
  amenities     TEXT[],
  agent_id      UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Saved/Wishlisted Properties ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.saved_properties (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id   UUID REFERENCES public.property_listings(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ── Property Enquiries ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.enquiries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id   UUID REFERENCES public.property_listings(id) ON DELETE SET NULL,
  message       TEXT,
  contact_phone TEXT,
  status        TEXT DEFAULT 'open' CHECK (status IN ('open','responded','closed')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Property Viewings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.viewings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id   UUID REFERENCES public.property_listings(id) ON DELETE CASCADE,
  viewing_date  TIMESTAMPTZ,
  notes         TEXT,
  status        TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_kyc_updated
  BEFORE UPDATE ON public.kyc_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_listings_updated
  BEFORE UPDATE ON public.property_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
