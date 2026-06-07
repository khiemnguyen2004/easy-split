-- Create the storage bucket used for all image uploads (chat images, fund
-- contribution proofs, debt-settlement proofs). The app uploads to
-- `attachments/<folder>/<file>` and reads back via getPublicUrl, so the bucket
-- must be public. Without this bucket, uploads fail with "Bucket not found".

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read (bucket is public; explicit policy is harmless and clear).
DROP POLICY IF EXISTS "Public can read attachments" ON storage.objects;
CREATE POLICY "Public can read attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'attachments');

-- Signed-in users may upload into the bucket.
DROP POLICY IF EXISTS "Authenticated can upload attachments" ON storage.objects;
CREATE POLICY "Authenticated can upload attachments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'attachments');

-- Signed-in users may update/replace objects in the bucket.
DROP POLICY IF EXISTS "Authenticated can update attachments" ON storage.objects;
CREATE POLICY "Authenticated can update attachments" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'attachments')
WITH CHECK (bucket_id = 'attachments');
