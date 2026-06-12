# PreLead Properties — Supabase Migrations

Run these scripts in order in your Supabase project's **SQL Editor**.

## Setup Steps

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **Anon Key** from Settings → API
3. Paste them into `js/supabase.js`:
   ```js
   const SUPABASE_URL = 'https://xxxx.supabase.co';
   const SUPABASE_KEY = 'your-anon-key';
   ```
4. Run migrations in order:
   - `001_initial_schema.sql` — tables and triggers
   - `002_rls_policies.sql` — row level security
   - `003_storage.sql` — file storage buckets

## Migration Files

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | Core tables: profiles, kyc_profiles, listings, saved_properties, enquiries, viewings |
| `002_rls_policies.sql` | Row Level Security policies + auto-profile-creation trigger |
| `003_storage.sql` | Storage buckets for KYC documents and property images |

## Authentication

Enable **Email** auth in Supabase Dashboard → Authentication → Providers.

Optionally enable Google, Apple OAuth for social sign-in.
