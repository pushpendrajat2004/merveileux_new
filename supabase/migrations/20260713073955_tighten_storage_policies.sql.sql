/*
# Tighten storage upload/delete policies to admin-only

## Overview
The storage bucket `club-media` had upload and delete policies scoped to
`TO authenticated` with `WITH CHECK (bucket_id = 'club-media')`. This allowed ANY
signed-in user to upload or delete files in the bucket, not just admins.

This migration rewrites those two policies to additionally require that the
authenticated user exists in the `admins` table.

## 1. Security Changes

### storage.objects
- `admin_upload_club_media` (INSERT): now requires EXISTS admin check
- `admin_delete_club_media` (DELETE): now requires EXISTS admin check

## 2. Notes
- The public read SELECT policy was already dropped in the previous migration.
  Public bucket objects are still accessible via their public URLs.
- Only designated admins can now upload or delete images in the bucket.
*/

DROP POLICY IF EXISTS "admin_upload_club_media" ON storage.objects;
CREATE POLICY "admin_upload_club_media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'club-media'
    AND EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_club_media" ON storage.objects;
CREATE POLICY "admin_delete_club_media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'club-media'
    AND EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );
