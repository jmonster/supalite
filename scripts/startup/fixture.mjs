// Deterministic two-owner task tracker. All identities and data are synthetic.
export const owner = '11111111-1111-4111-8111-111111111111';
export const otherOwner = '22222222-2222-4222-8222-222222222222';
export const secret = 'synthetic-startup-benchmark-secret-never-use-in-production';
export const ddl = `
CREATE TABLE projects (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE tasks (
  id integer PRIMARY KEY,
  project_id integer NOT NULL REFERENCES projects(id),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_owner_status ON tasks(owner_id, status);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_tasks ON tasks FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY reviewer_tasks ON tasks FOR SELECT TO reviewer USING (status = 'open');
`;
export const rows = Array.from({ length: 200 }, (_, index) => {
  const id = index + 1;
  return {
    id,
    project_id: id % 2 ? 1 : 2,
    owner_id: id % 2 ? owner : otherOwner,
    title: `Task ${String(id).padStart(3, '0')}`,
    status: id % 5 ? 'open' : 'closed',
    metadata: JSON.stringify({ priority: id % 3, labels: ['synthetic', 'startup'] }),
  };
});
export const expected = rows
  .filter((row) => row.owner_id === owner && row.status === 'open')
  .map(({ id, title, status, metadata }) => ({
    id, title, status, metadata: JSON.parse(metadata), projects: { name: 'Roadmap' },
  }));
export const select = 'id,title,status,metadata,projects(name)';
