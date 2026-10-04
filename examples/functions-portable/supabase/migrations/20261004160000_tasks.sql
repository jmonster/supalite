CREATE TABLE public.tasks (
  id text PRIMARY KEY,
  title text NOT NULL,
  completed integer NOT NULL DEFAULT 0 CHECK (completed IN (0, 1))
);
-- This isolated portability fixture is deliberately public. It is not an RLS test.
GRANT SELECT, INSERT, UPDATE ON public.tasks TO anon, authenticated;
