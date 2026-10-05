CREATE TABLE public.z_projects (
  id serial PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL,
  UNIQUE (id, owner_id)
);
CREATE TABLE public.a_records (
  id serial PRIMARY KEY,
  project_id integer NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  payload jsonb NOT NULL,
  FOREIGN KEY (project_id, owner_id) REFERENCES public.z_projects(id, owner_id)
);
ALTER TABLE public.z_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.a_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_owner ON public.z_projects FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY records_owner ON public.a_records FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.z_projects, public.a_records TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.z_projects_id_seq, public.a_records_id_seq TO authenticated;
