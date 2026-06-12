-- ================================================================
-- PRELEAD PROPERTIES — Storage Buckets  v1.0
-- Run after 002_rls_policies.sql in Supabase SQL Editor
-- ================================================================

-- Create KYC documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  FALSE,
  5242880,  -- 5MB
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create property images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  TRUE,
  10485760,  -- 10MB
  ARRAY['image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ── KYC Bucket Policies ───────────────────────────────────────
CREATE POLICY "Users upload their own KYC docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read their own KYC docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete their own KYC docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'kyc-documents' AND
    auth.uid()::TEXT = (storage.foldername(name))[1]
  );

-- ── Property Images Bucket Policies ──────────────────────────
CREATE POLICY "Property images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
