import { createHarness } from "./lite.mjs";

export async function harness(flavor, backend = "node") {
  const h = await createHarness({
    flavor,
    backend,
    ddl: "CREATE TABLE head_docs(id integer PRIMARY KEY, label text, body jsonb, nullable text); CREATE VIEW head_view AS SELECT * FROM head_docs;",
  });
  for (let id = 1; id <= 6; id++) {
    await h.connection.kysely.insertInto("head_docs").values({
      id,
      label: id === 1 ? "a" : "é🙂".repeat(id),
      body: JSON.stringify({ active: id % 2 === 0, notes: "x".repeat(4096) }),
      nullable: null,
    }).execute();
  }
  return h;
}

export async function request(h, search = "", headers = {}, method = "HEAD", table = "head_docs") {
  const response = await h.app.fetch(new Request(`http://localhost/rest/v1/${table}?${search}`, {
    method,
    headers,
  }));
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
  };
}
