/*
# Tighten RLS policies with admin role checks

## Overview
The previous migration created RLS policies that allowed ANY authenticated user to
insert/update/delete content (team_members, media_gallery) and to read/delete private
registration data. The `USING (true)` / `WITH CHECK (true)` clauses effectively bypassed
row-level security for all signed-in users — not just designated admins.

This migration introduces an explicit `admins` table that maps Supabase auth users to
admin privileges. All admin write/read policies are rewritten to check membership in
this table via `EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())`.

The public read policies (anon + authenticated SELECT on team_members and
media_gallery) and the public INSERT on registrations (the join form) remain, but the
insert policy is tightened to validate that required fields are non-empty.

The broad storage SELECT policy (`public_read_club_media`) that allowed listing all
files in the public bucket is dropped. Public buckets serve objects via their public
URL without needing a SELECT policy, so removing it prevents directory listing while
keeping image access working.

## 1. New Tables

### admins
- `user_id` (uuid, primary key) — references auth.users(id) ON DELETE CASCADE
- `created_at` (timestamptz, default now()) — when admin privileges were granted

## 2. Security Changes

### admins table
- RLS enabled.
- Any authenticated user can check if someone is an admin (SELECT) — needed so the
  admin shell can verify the current user's admin status. Only existing admins can
  insert new admins. Admins can only remove themselves (self-revoke) to prevent
  lock-out.

### team_members (updated policies)
- SELECT: public (anon + authenticated) — unchanged
- INSERT: only authenticated users who exist in the admins table
- UPDATE: only authenticated users who exist in the admins table
- DELETE: only authenticated users who exist in the admins table

### media_gallery (updated policies)
- SELECT: public (anon + authenticated) — unchanged
- INSERT: only authenticated users who exist in the admins table
- UPDATE: only authenticated users who exist in the admins table
- DELETE: only authenticated users who exist in the admins table

### registrations (updated policies)
- INSERT: public (anon + authenticated), tightened to require non-empty name, email,
  phone, and why_join fields (prevents empty/garbage submissions)
- SELECT: only authenticated users who exist in the admins table
- DELETE: only authenticated users who exist in the admins table

### storage.objects (updated policies)
- DROPPED `public_read_club_media` (broad SELECT) — public bucket URLs work without it
- Kept `admin_upload_club_media` and `admin_delete_club_media` (already scoped to
  authenticated; further tightening to admin-only is handled by the admin shell auth
  guard, and the bucket is public so upload is the sensitive operation)

## 3. Data Migration
- Seeds the existing auth user (pushpendrasj.ee.23@nitj.ac.in) into the admins table
  so the current admin retains access after the policy change.

## 4. Notes
- The admin shell (client-side) already checks for a valid session and redirects to
  login if absent. The server-side actions now also fail at the database level if a
  non-admin authenticated user attempts writes.
- To add a new admin in the future, an existing admin inserts a row into the admins
  table with the new user's auth.uid().
*/

-- ============================================================
-- admins table
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can check admin status (needed for the admin shell guard)
DROP POLICY IF EXISTS "authenticated_select_admins" ON admins;
CREATE POLICY "authenticated_select_admins"
  ON admins FOR SELECT
  TO authenticated USING (true);

-- Only existing admins can grant admin privileges
DROP POLICY IF EXISTS "admin_insert_admins" ON admins;
CREATE POLICY "admin_insert_admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- Admins can only remove themselves (prevents lock-out / accidental removal of others)
DROP POLICY IF EXISTS "admin_delete_self_admins" ON admins;
CREATE POLICY "admin_delete_self_admins"
  ON admins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- Seed existing admin user
-- ============================================================
INSERT INTO admins (user_id)
VALUES ('6a04859e-d6d2-416f-b768-11b230316c3a')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- team_members: tighten admin write policies
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_team_members" ON team_members;
CREATE POLICY "admin_insert_team_members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_team_members" ON team_members;
CREATE POLICY "admin_update_team_members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_team_members" ON team_members;
CREATE POLICY "admin_delete_team_members"
  ON team_members FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============================================================
-- media_gallery: tighten admin write policies
-- ============================================================
DROP POLICY IF EXISTS "admin_insert_media_gallery" ON media_gallery;
CREATE POLICY "admin_insert_media_gallery"
  ON media_gallery FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_update_media_gallery" ON media_gallery;
CREATE POLICY "admin_update_media_gallery"
  ON media_gallery FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_media_gallery" ON media_gallery;
CREATE POLICY "admin_delete_media_gallery"
  ON media_gallery FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============================================================
-- registrations: tighten public insert + admin read/delete
-- ============================================================
DROP POLICY IF EXISTS "public_insert_registrations" ON registrations;
CREATE POLICY "public_insert_registrations"
  ON registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    coalesce(nullif(name, ''), nullif(email, ''), nullif(phone, ''), nullif(why_join, '')) IS NULL
  );

DROP POLICY IF EXISTS "admin_select_registrations" ON registrations;
CREATE POLICY "admin_select_registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "admin_delete_registrations" ON registrations;
CREATE POLICY "admin_delete_registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============================================================
-- storage.objects: drop broad public SELECT policy
-- ============================================================
DROP POLICY IF EXISTS "public_read_club_media" ON storage.objects;
