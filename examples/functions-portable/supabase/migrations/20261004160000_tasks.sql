CREATE TABLE public.tasks (
  id text PRIMARY KEY,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  title text NOT NULL,
  completed integer NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  attachment_path text
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.tasks TO authenticated;
CREATE POLICY own_tasks ON public.tasks FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- The app creates its private bucket through the Storage SDK, not a data seed.
CREATE POLICY create_demo_bucket ON storage.buckets FOR INSERT TO authenticated
  WITH CHECK (id = 'task-attachments' AND owner_id = auth.uid()::text AND public = false);
CREATE POLICY read_demo_bucket ON storage.buckets FOR SELECT TO authenticated
  USING (id = 'task-attachments');
CREATE POLICY own_attachments ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'task-attachments' AND owner_id = auth.uid()::text)
  WITH CHECK (bucket_id = 'task-attachments' AND owner_id = auth.uid()::text
    AND (storage.foldername(name))[1] = auth.uid()::text);
