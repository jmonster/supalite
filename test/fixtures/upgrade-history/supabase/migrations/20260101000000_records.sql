CREATE SCHEMA IF NOT EXISTS archive;
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE SCHEMA IF NOT EXISTS supabase_migrations_archive;
CREATE TABLE public.z_projects (
  id serial PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL
);
CREATE TABLE public.a_records (
  id serial PRIMARY KEY,
  project_id integer NOT NULL REFERENCES public.z_projects(id),
  payload jsonb NOT NULL,
  doubled integer GENERATED ALWAYS AS (id * 2) STORED
);
CREATE TABLE public.schema_migrations (id serial PRIMARY KEY, note text NOT NULL);
CREATE TABLE public.seed_files (id serial PRIMARY KEY, note text NOT NULL);
CREATE TABLE archive.schema_migrations (id serial PRIMARY KEY, note text NOT NULL);
CREATE TABLE archive.seed_files (id serial PRIMARY KEY, note text NOT NULL);
CREATE TABLE supabase_migrations.application_rows (id serial PRIMARY KEY, note text NOT NULL);
CREATE TABLE supabase_migrations_archive.schema_migrations (id serial PRIMARY KEY, note text NOT NULL);
