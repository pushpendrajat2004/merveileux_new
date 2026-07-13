/*
# Create MERVEILLEUX club schema (multi-user with admin auth)

## Overview
Creates the full data model for the MERVEILLEUX fashion & modelling club website.
Three content tables power the public site; admin users (authenticated via Supabase
email/password) manage everything from the /admin dashboard.

## 1. New Tables

### team_members
- `id` (uuid, primary key) — auto-generated
- `name` (text, not null) — member's full name
- `position` (text, not null) — role in the club (e.g. "President", "Model")
- `branch` (text, not null) — academic branch (e.g. "CSE", "ECE")
- `image_urls` (text[], not null, default empty array) — Supabase Storage public URLs
- `created_at` (timestamptz, default now()) — creation timestamp

### media_gallery
- `id` (uuid, primary key) — auto-generated
- `type` (text, not null) — either 'lookbook' or 'history'
- `media_url` (text, not null) — Supabase Storage public URL of the image
- `caption` (text, nullable) — optional caption shown on the site
- `created_at` (timestamptz, default now()) — creation timestamp

### registrations
- `id` (uuid, primary key) — auto-generated
- `name` (text, not null) — applicant's full name
- `email` (text, not null) — applicant's email
- `phone` (text, not null) — applicant's phone number
- `why_join` (text, not null) — free-text reason for joining
- `created_at` (timestamptz, default now()) — submission timestamp

## 2. Security (RLS)

### team_members
- Public (anon + authenticated) can SELECT — shown on the public site
- Only authenticated admin users can INSERT / UPDATE / DELETE

### media_gallery
- Public (anon + authenticated) can SELECT — shown on the public site
- Only authenticated admin users can INSERT / UPDATE / DELETE

### registrations
- Public (anon + authenticated) can INSERT — the join form is public
- Only authenticated admin users can SELECT / DELETE — private applicant data

## 3. Storage
- Creates a public storage bucket "club-media" for team and gallery images.
- Adds storage policies so authenticated admin users can upload/delete, while
  everyone can read the public image URLs.

## 4. Notes
- This is a multi-user app with a sign-in screen. Public read uses the anon key;
  admin writes require an authenticated session.
- registrations SELECT is authenticated-only because it contains private PII
  (name, email, phone).
- No user_id columns are needed since there is a single shared admin role rather
  than per-user ownership.
*/

-- ============================================================
-- team_members
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  branch text NOT NULL,
  image_urls text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_team_members" ON team_members;
CREATE POLICY "public_select_team_members"
  ON team_members FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_team_members" ON team_members;
CREATE POLICY "admin_insert_team_members"
  ON team_members FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_team_members" ON team_members;
CREATE POLICY "admin_update_team_members"
  ON team_members FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_team_members" ON team_members;
CREATE POLICY "admin_delete_team_members"
  ON team_members FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- media_gallery
-- ============================================================
CREATE TABLE IF NOT EXISTS media_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('lookbook', 'history')),
  media_url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_media_gallery" ON media_gallery;
CREATE POLICY "public_select_media_gallery"
  ON media_gallery FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_media_gallery" ON media_gallery;
CREATE POLICY "admin_insert_media_gallery"
  ON media_gallery FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_media_gallery" ON media_gallery;
CREATE POLICY "admin_update_media_gallery"
  ON media_gallery FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_media_gallery" ON media_gallery;
CREATE POLICY "admin_delete_media_gallery"
  ON media_gallery FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- registrations
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  why_join text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_registrations" ON registrations;
CREATE POLICY "public_insert_registrations"
  ON registrations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations"
  ON registrations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_delete_registrations" ON registrations;
CREATE POLICY "admin_delete_registrations"
  ON registrations FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- Storage bucket + policies
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('club-media', 'club-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_club_media" ON storage.objects;
CREATE POLICY "public_read_club_media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'club-media');

DROP POLICY IF EXISTS "admin_upload_club_media" ON storage.objects;
CREATE POLICY "admin_upload_club_media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'club-media');

DROP POLICY IF EXISTS "admin_delete_club_media" ON storage.objects;
CREATE POLICY "admin_delete_club_media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'club-media');
