import { createHash, randomUUID } from "node:crypto";
import { lstat, readdir, realpath } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

const bucketColumns = [
  "id",
  "name",
  "owner",
  "owner_id",
  "public",
  "file_size_limit",
  "allowed_mime_types",
  "created_at",
  "updated_at",
];
const objectColumns = [
  "id",
  "bucket_id",
  "name",
  "owner",
  "owner_id",
  "metadata",
  "user_metadata",
  "path_tokens",
  "version",
  "created_at",
  "updated_at",
  "last_accessed_at",
];
const operational = new Set([
  "eTag",
  "etag",
  "lastModified",
  "size",
  "contentLength",
  "mimetype",
  "cacheControl",
  "version",
  "httpStatusCode",
  "contentRange",
]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (message) => {
  throw new Error(`Storage upgrade: ${message}`);
};
const canonical = (value) =>
  JSON.stringify(value, (_, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]]),
        )
      : item,
  );
const digest = (value) =>
  createHash("sha256").update(canonical(value)).digest("hex");
const equal = (actual, expected, label) => {
  if (canonical(actual) !== canonical(expected))
    fail(`${label} verification failed`);
};
const quote = (value) =>
  `E'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
function sqlValue(value, column) {
  if (value === null) return "NULL";
  if (["metadata", "user_metadata"].includes(column))
    return `${quote(JSON.stringify(value))}::jsonb`;
  if (column === "allowed_mime_types")
    return `ARRAY[${value.map(quote).join(",")}]::text[]`;
  if (typeof value === "boolean" || typeof value === "number")
    return String(value);
  return quote(value);
}
function insert(table, row, initialVersion) {
  const columns = Object.keys(row).filter(
    (column) =>
      column !== "path_tokens" &&
      (table !== "objects" ||
        !["version", "updated_at", "last_accessed_at"].includes(column)),
  );
  const values = columns.map((column) => sqlValue(row[column], column));
  if (initialVersion !== undefined) {
    columns.push("version");
    values.push(sqlValue(initialVersion, "version"));
  }
  return `INSERT INTO storage.${table} (${columns.map((column) => `"${column}"`).join(",")}) VALUES (${values.join(",")});`;
}
export function storageInserts(snapshot) {
  return [
    ...snapshot.buckets.map((row) => insert("buckets", row)),
    ...snapshot.objects.map(({ row }) => insert("objects", row)),
  ];
}
function decimal(value) {
  const [coefficient, power = "0"] = value.toLowerCase().split("e");
  const [whole, fraction = ""] = coefficient.split(".");
  const negative = whole.startsWith("-");
  let digits = (whole.replace("-", "") + fraction).replace(/^0+/, "");
  if (!digits) return "0";
  const trimmed = digits.replace(/0+$/, "");
  const exponent =
    BigInt(power) -
    BigInt(fraction.length) +
    BigInt(digits.length - trimmed.length);
  return `${negative ? "-" : ""}${trimmed}e${exponent}`;
}
function parseJson(value, label, array = false) {
  if (value === null) {
    if (array) return null;
    fail(`${label} is SQL NULL; set an explicit JSON object before upgrading`);
  }
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      fail(`${label} contains invalid JSON`);
    }
  }
  if (
    array
      ? !Array.isArray(parsed) ||
        parsed.some((item) => typeof item !== "string")
      : !parsed || typeof parsed !== "object" || Array.isArray(parsed)
  ) {
    fail(
      `${label} must be ${array ? "a text array" : "a JSON object; JSON null/scalar/array metadata is unsupported"}`,
    );
  }
  JSON.stringify(parsed, (_, item) => {
    if (
      typeof item === "number" &&
      (!Number.isFinite(item) ||
        (Number.isInteger(item) && !Number.isSafeInteger(item)))
    ) {
      fail(`${label} contains a number that cannot be preserved exactly`);
    }
    return item;
  });
  // SQLite stores raw JSON text. Check numeric tokens outside strings before
  // accepting JS's parsed values; otherwise rounded decimals can pass verification.
  if (typeof value === "string") {
    for (const [, number] of value.matchAll(
      /"(?:\\.|[^"\\])*"|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    )) {
      if (
        number &&
        decimal(number) !== decimal(JSON.stringify(Number(number)))
      ) {
        fail(`${label} contains a number that cannot be preserved exactly`);
      }
    }
  }
  return parsed;
}
function pathName(value, label, nested = false) {
  if (
    typeof value !== "string" ||
    /[\u0000-\u001f\u007f\\]/u.test(value) ||
    (!nested && value.includes("/")) ||
    value.split("/").some((part) => !part || part === "." || part === "..")
  )
    fail(`${label} has an unsupported path ${JSON.stringify(value)}`);
  if (Buffer.byteLength(value) > 1024) fail(`${label} exceeds 1024 bytes`);
  // storage-api 1.54.1 validates the decoded key with this ASCII character set.
  if (!/^[\w/!\-.*'() &$@=;:+,?]+$/.test(value))
    fail(
      `${label}: Storage 1.54.1 rejects this name ${JSON.stringify(value)}; Unicode and %, #, brackets are unsupported`,
    );
  return value;
}
function normalizeRow(source, table) {
  const row = { ...source },
    columns = table === "buckets" ? bucketColumns : objectColumns;
  const label =
    table === "buckets"
      ? `bucket ${JSON.stringify(row.id)}`
      : `object ${JSON.stringify(`${row.bucket_id}/${row.name}`)}`;
  for (const column of Object.keys(row))
    if (!columns.includes(column))
      fail(`${label} has unsupported column ${column}`);
  for (const column of columns)
    if (!(column in row)) fail(`${label} is missing column ${column}`);
  for (const column of ["owner", "owner_id"])
    if (row[column] !== null && typeof row[column] !== "string")
      fail(`${label}.${column} must be text or NULL`);
  if (row.owner !== null && !uuid.test(row.owner))
    fail(`${label}.owner is not a UUID`);
  for (const column of columns.filter((column) => column.endsWith("_at")))
    if (row[column] !== null && !Number.isFinite(Date.parse(row[column])))
      fail(`${label}.${column} is not a timestamp`);
  if (table === "buckets") {
    pathName(row.id, label);
    pathName(row.name, label);
    if (row.name.length > 100 || row.id.length > 100)
      fail(`${label} name/id exceeds 100 characters`);
    if (![true, false, 0, 1].includes(row.public))
      fail(`${label}.public must be boolean`);
    row.public = !!row.public;
    if (row.file_size_limit !== null) {
      row.file_size_limit = Number(row.file_size_limit);
      if (!Number.isSafeInteger(row.file_size_limit) || row.file_size_limit < 0)
        fail(`${label} has invalid file_size_limit`);
    }
    row.allowed_mime_types = parseJson(
      row.allowed_mime_types,
      `${label}.allowed_mime_types`,
      true,
    );
  } else {
    if (!uuid.test(row.id)) fail(`${label}.id is not a UUID`);
    pathName(row.bucket_id, label);
    pathName(row.name, label, true);
    row.metadata = parseJson(row.metadata, `${label}.metadata`);
    row.user_metadata = parseJson(row.user_metadata, `${label}.user_metadata`);
    equal(
      parseJson(row.path_tokens, `${label}.path_tokens`, true),
      row.name.split("/"),
      `${label} path tokens`,
    );
    row.path_tokens = row.name.split("/");
    // Base64 plus header framing must fit Kong's 8 KiB request-header line.
    if (Buffer.byteLength(JSON.stringify(row.user_metadata)) > 6000)
      fail(
        `${label}.user_metadata exceeds the supported 6000-byte upload header limit`,
      );
  }
  return row;
}
function fileLimit(value = "50MiB") {
  const match = value.match(/^(\d+(?:\.\d+)?)\s*(B|KB|KiB|MB|MiB|GB|GiB)$/i);
  const units = {
    B: 1,
    KB: 1000,
    KIB: 1024,
    MB: 1e6,
    MIB: 1048576,
    GB: 1e9,
    GIB: 1073741824,
  };
  const size =
    match && Math.floor(Number(match[1]) * units[match[2].toUpperCase()]);
  if (!Number.isSafeInteger(size) || size <= 0)
    fail(`invalid storage.file_size_limit ${JSON.stringify(value)}`);
  return size;
}
async function inventoryFiles(root) {
  const files = [];
  async function walk(directory, prefix = "") {
    let stat;
    try {
      stat = await lstat(directory);
    } catch (error) {
      if (!prefix && error.code === "ENOENT") return;
      throw error;
    }
    if (stat.isSymbolicLink()) fail(`symlink ${directory} is unsupported`);
    if (stat.isDirectory()) {
      for (const name of await readdir(directory))
        await walk(join(directory, name), prefix ? `${prefix}/${name}` : name);
    } else if (stat.isFile() && prefix)
      files.push({
        name: prefix,
        size: stat.size,
        mtime: stat.mtimeMs,
        ino: stat.ino,
      });
    else fail(`non-regular file ${directory} is unsupported`);
  }
  await walk(root);
  if (files.length && (await realpath(root)) !== root)
    fail("symlinked storage roots are unsupported");
  return files.sort((a, b) => a.name.localeCompare(b.name));
}
async function storageRows(app) {
  const tables = (await app.connection.introspect()).tables;
  const names = tables
    .filter(
      (table) =>
        table.schema === "storage" || table.name.startsWith("storage."),
    )
    .map((table) =>
      table.schema === "storage" ? table.name : table.name.slice(8),
    );
  if (names.some((name) => !["buckets", "objects"].includes(name)))
    fail("custom Storage tables and multipart state are unsupported");
  if (names.includes("buckets") !== names.includes("objects"))
    fail("incomplete Storage schema");
  const result = { buckets: [], objects: [] };
  for (const table of names) {
    for (let offset = 0; ; offset += 250) {
      const tableSql =
        app.connection.dialect === "sqlite"
          ? `"storage.${table}"`
          : `storage."${table}"`;
      const rows = (
        await app.connection.exec(
          `SELECT * FROM ${tableSql} ORDER BY id LIMIT 250 OFFSET ${offset}`,
        )
      ).rows;
      result[table].push(...rows.map((row) => normalizeRow(row, table)));
      if (rows.length < 250) break;
    }
  }
  return result;
}
async function hashBody(body, signal) {
  const reader = body.getReader(),
    hash = createHash("sha256");
  const stop = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener("abort", stop, { once: true });
  let size = 0;
  try {
    signal?.throwIfAborted();
    for (;;) {
      const { done, value } = await reader.read();
      signal?.throwIfAborted();
      if (done) break;
      const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
      size += bytes.byteLength;
      hash.update(bytes);
    }
    return { size, sha256: hash.digest("hex") };
  } finally {
    signal?.removeEventListener("abort", stop);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
/** No source writes. Keep the source quiescent until the complete upgrade returns. */
export async function inspectStorage(
  app,
  { target, quiescent, sourceRoot, adapterClass } = {},
) {
  const root = resolve(
    sourceRoot ?? join(process.cwd(), "supabase/.temp/storage"),
  );
  const rows = await storageRows(app),
    files = await inventoryFiles(root);
  // Storage is enabled by default in Lite config even when it has never been used.
  if (!rows.buckets.length && !rows.objects.length && !files.length)
    return null;
  if (target !== "local")
    fail("Storage requires --target local; hosted graduation is unsupported");
  if (!quiescent)
    fail(
      "stop source writers, then pass --storage-quiescent for the snapshot/transfer window",
    );
  if (app.connection.dialect !== "sqlite" || app.config.db?.driver === "sqlite")
    fail(
      "Storage migration requires filesystem-backed SQLite with PostgreSQL migrations",
    );
  const adapter = app._storageAdapter;
  if (
    !adapterClass ||
    !(adapter instanceof adapterClass) ||
    resolve(adapter.basePath) !== root
  )
    fail(
      "only the stock CLI filesystem adapter at supabase/.temp/storage is supported (enable EXPERIMENTAL_STORAGE=1)",
    );
  const globalLimit = fileLimit(app.config.storage?.file_size_limit),
    byBucket = new Map(rows.buckets.map((row) => [row.id, row]));
  const byFile = new Map(files.map((file) => [file.name, file])),
    objects = [];
  for (const row of rows.objects) {
    const label = `${row.bucket_id}/${row.name}`,
      file = byFile.get(label),
      bucket = byBucket.get(row.bucket_id);
    if (!bucket || !file)
      fail(
        `${label} has ${!bucket ? "no bucket" : "no source file"}; restore the missing source data before retrying`,
      );
    const { mimetype: contentType, cacheControl } = row.metadata;
    if (Object.hasOwn(row.metadata, "xRobotsTag"))
      fail(`${label}: xRobotsTag metadata cannot be migrated`);
    if (row.name.endsWith(".emptyFolderPlaceholder"))
      fail(
        `${label}: special folder placeholders cannot be migrated`,
      );
    if (
      typeof contentType !== "string" ||
      !/^[\w!#$&^.+-]+\/[\w!#$&^.+-]+(?:\s*;[^\r\n]*)?$/.test(contentType) ||
      contentType.startsWith("multipart/")
    )
      fail(`${label} has unsupported MIME ${JSON.stringify(contentType)}`);
    if (
      typeof cacheControl !== "string" ||
      !cacheControl ||
      /[\u0000-\u001f\u007f]/u.test(cacheControl)
    )
      fail(`${label} has unsupported cache-control metadata`);
    try {
      const encoded = new Headers({
        "content-type": contentType,
        "cache-control": cacheControl,
      });
      if (
        /[\u0000-\u001f\u007f]/u.test(contentType) ||
        encoded.get("content-type") !== contentType ||
        encoded.get("cache-control") !== cacheControl
      )
        throw new Error();
    } catch {
      fail(
        `${label}: MIME/cache-control cannot be sent unchanged as HTTP headers`,
      );
    }
    if (Buffer.byteLength(contentType + cacheControl) > 2048) {
      fail(`${label}: MIME/cache-control exceed the supported 2048-byte header budget`);
    }
    const limit = Math.min(globalLimit, bucket.file_size_limit ?? Infinity),
      allowed = bucket.allowed_mime_types;
    if (file.size > limit)
      fail(
        `${label}: ${file.size} bytes exceeds effective limit ${limit} (global ${globalLimit}, bucket ${bucket.file_size_limit ?? "unset"}); correct the source file/limit before retrying`,
      );
    const mime = contentType;
    if (
      allowed?.length &&
      !allowed.some(
        (rule) =>
          rule === mime ||
          (rule.endsWith("/*") && mime.startsWith(rule.slice(0, -1))),
      )
    )
      fail(
        `${label}: MIME ${contentType} conflicts with allowed_mime_types ${JSON.stringify(allowed)}; correct the source restriction before retrying`,
      );
    for (const key of ["size", "contentLength"])
      if (row.metadata[key] != null && Number(row.metadata[key]) !== file.size)
        fail(
          `${label}: source size ${file.size} differs from metadata.${key}=${row.metadata[key]}`,
        );
    const opened = await adapter.getObject(
      row.bucket_id,
      row.name,
      row.version,
    );
    if (opened.httpStatusCode !== 200 || !opened.body) {
      await opened.body?.cancel();
      fail(`${label}: source did not return a complete file`);
    }
    const hash = await hashBody(opened.body);
    if (hash.size !== file.size) fail(`${label}: source changed while hashing`);
    objects.push({ row, ...hash, contentType, cacheControl });
    byFile.delete(label);
  }
  if (byFile.size)
    fail(
      `orphan file ${JSON.stringify(byFile.keys().next().value)} has no object row; it cannot be silently discarded`,
    );
  const snapshot = {
    root,
    buckets: rows.buckets,
    objects,
    globalLimit,
    fingerprint: digest({ rows, files, config: app.config.storage }),
  };
  await assertStorageUnchanged(app, snapshot);
  return snapshot;
}
export async function assertStorageUnchanged(app, snapshot) {
  equal(
    digest({
      rows: await storageRows(app),
      files: await inventoryFiles(snapshot.root),
      config: app.config.storage,
    }),
    snapshot.fingerprint,
    "source rows/files changed; discard the partial target and retry from a quiescent source",
  );
}
async function physicalPath(directory) {
  let existing = resolve(directory);
  const missing = [];
  for (;;) {
    try {
      existing = await realpath(existing);
      break;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      missing.unshift(basename(existing));
      existing = dirname(existing);
    }
  }
  return join(existing, ...missing);
}
export async function requireFreshStorageDirectory(directory, sourceRoot) {
  const target = await physicalPath(directory);
  for (const source of [process.cwd(), sourceRoot].filter(Boolean)) {
    const path = relative(await physicalPath(source), target);
    if (
      !path ||
      (path !== ".." && !path.startsWith(`..${sep}`) && !path.startsWith(sep))
    ) {
      fail(
        `target directory ${directory} must be outside the source project and Storage tree`,
      );
    }
  }
  try {
    if ((await readdir(directory)).length)
      fail(
        `target directory ${directory} must be new or empty; never use the source project directory`,
      );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

// Compare managed shape before/after migration replay. Policies and incoming app
// FKs are allowed; custom Storage columns, triggers, rules and outgoing FKs are not.
export async function storageShape(query) {
  const results = [];
  for (const sql of [
    `SELECT table_name,column_name,udt_name,is_nullable,is_generated,generation_expression FROM information_schema.columns WHERE table_schema='storage' AND table_name IN ('buckets','objects') ORDER BY table_name,ordinal_position`,
    `SELECT c.relname,t.tgname,pg_get_triggerdef(t.oid) AS definition,p.prosrc,p.proconfig,p.prosecdef,t.tgenabled FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_proc p ON p.oid=t.tgfoid WHERE n.nspname='storage' AND c.relname IN ('buckets','objects') AND NOT t.tgisinternal ORDER BY c.relname,t.tgname`,
    `SELECT c.relname,k.conname,pg_get_constraintdef(k.oid) AS definition FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='storage' AND c.relname IN ('buckets','objects') ORDER BY c.relname,k.conname`,
    `SELECT tablename,rulename,definition FROM pg_rules WHERE schemaname='storage' AND tablename IN ('buckets','objects') ORDER BY tablename,rulename`,
  ])
    results.push((await query(sql)).rows);
  return canonical(results);
}
export async function assertStorageEmpty(query) {
  const { rows } = await query(
    "SELECT 'buckets' AS table_name,id::text FROM storage.buckets UNION ALL SELECT 'objects',id::text FROM storage.objects LIMIT 1",
  );
  if (rows.length)
    fail(
      `fresh target required: migration-seeded or existing storage.${rows[0].table_name} row ${JSON.stringify(rows[0].id)}; merging is unsupported`,
    );
}
export async function assertStorageShape(query, expected) {
  equal(
    await storageShape(query),
    expected,
    "unsupported custom Storage schema/trigger/dependency",
  );
  await assertStorageEmpty(query);
}
// API verification reads can touch last_accessed_at; updated_at is target-derived.
// Everything that determines bucket identity, ownership, location or file content
// must remain unchanged while application-row triggers execute.
export async function storageState(query) {
  const { rows } =
    await query(`SELECT 'buckets' AS kind,id::text,to_jsonb(b) AS record FROM storage.buckets b
    UNION ALL SELECT 'objects',id::text,to_jsonb(o)-'updated_at'-'last_accessed_at' FROM storage.objects o ORDER BY kind,id`);
  return digest(rows);
}
function targetOrigin(target) {
  const url = new URL(target.status.apiUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !["127.0.0.1", "[::1]", "localhost"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    fail("only a loopback local Storage target is supported");
  let claims;
  try {
    claims = JSON.parse(
      Buffer.from(target.status.serviceRoleKey.split(".")[1], "base64url"),
    );
  } catch {
    fail("target service-role JWT is malformed");
  }
  if (claims?.role !== "service_role" || Object.hasOwn(claims, "sub"))
    fail(
      "target service-role JWT must have no sub claim, so upload preserves existing owners",
    );
  return url.origin;
}
const headers = (target) => ({
  authorization: `Bearer ${target.status.serviceRoleKey}`,
  apikey: target.status.serviceRoleKey,
});
async function cancel(body) {
  if (body && !body.locked) await body.cancel().catch(() => {});
}
export async function waitForStorage(target, timeoutMs = 60000, signal) {
  signal?.throwIfAborted();
  const origin = targetOrigin(target),
    deadline = Date.now() + timeoutMs;
  do {
    signal?.throwIfAborted();
    try {
      const timeout = AbortSignal.timeout(
        Math.max(1, Math.min(5000, deadline - Date.now())),
      );
      const response = await fetch(`${origin}/storage/v1/bucket`, {
        headers: headers(target),
        signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        redirect: "error",
      });
      await cancel(response.body);
      signal?.throwIfAborted();
      if (response.ok) return;
      if ([401, 403].includes(response.status))
        fail(`target Storage authentication failed (HTTP ${response.status})`);
    } catch (error) {
      signal?.throwIfAborted();
      if (error.message.startsWith("Storage upgrade:")) throw error;
    }
    if (Date.now() < deadline)
      await new Promise((resolve) => setTimeout(resolve, 250));
  } while (Date.now() < deadline);
  signal?.throwIfAborted();
  fail("target Storage API did not become ready");
}
async function verifyRow(query, table, row) {
  const { rows } = await query(
    `SELECT *,created_at IS NOT DISTINCT FROM ${sqlValue(row.created_at)}::timestamptz AS created_matches FROM storage.${table} WHERE id=${quote(row.id)}`,
  );
  if (rows.length !== 1 || !rows[0].created_matches)
    fail(`${table}/${row.id}: missing row or changed creation time`);
  const saved = rows[0];
  for (const key of table === "buckets"
    ? bucketColumns.filter((key) => !key.endsWith("_at"))
    : ["id", "bucket_id", "name", "owner", "owner_id", "user_metadata"]) {
    const actual =
      key === "file_size_limit" && saved[key] !== null
        ? Number(saved[key])
        : saved[key];
    equal(actual, row[key], `${table}/${row.id}.${key}`);
  }
  return saved;
}
/** Serial, backpressured streams. A failure throws before any application-row import. */
export async function transferStorage(app, snapshot, target, signal) {
  signal?.throwIfAborted();
  const origin = targetOrigin(target);
  const query = async (sql, requestSignal = signal) => {
    requestSignal?.throwIfAborted();
    const result = await target.runSql(sql);
    requestSignal?.throwIfAborted();
    return result;
  };
  await assertStorageUnchanged(app, snapshot);
  await assertStorageEmpty(query);
  for (const row of snapshot.buckets)
    await query(insert("buckets", row));
  for (const object of snapshot.objects) {
    signal?.throwIfAborted();
    const { row, size, sha256, contentType, cacheControl } = object;
    const label = `${row.bucket_id}/${row.name}`,
      controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120000);
    const requestSignal = signal
      ? AbortSignal.any([signal, controller.signal]) : controller.signal;
    const url = `${origin}/storage/v1/object/${encodeURIComponent(row.bucket_id)}/${row.name.split("/").map(encodeURIComponent).join("/")}`;
    let reader, upload, download;
    const close = () => reader?.cancel().catch(() => {});
    requestSignal.addEventListener("abort", close, { once: true });
    const objectQuery = (sql) => query(sql, requestSignal);
    try {
      requestSignal.throwIfAborted();
      const source = await app._storageAdapter.getObject(
        row.bucket_id,
        row.name,
        row.version,
      );
      if (source.body) reader = source.body.getReader();
      requestSignal.throwIfAborted();
      if (source.httpStatusCode !== 200 || !source.body) {
        await cancel(source.body);
        fail(`${label}: source file is unavailable`);
      }
      const hash = createHash("sha256");
      let sent = 0,
        complete = false;
      const body = new ReadableStream(
        {
          async pull(stream) {
            try {
              requestSignal.throwIfAborted();
              const { done, value } = await reader.read();
              requestSignal.throwIfAborted();
              if (done) {
                if (sent !== size || hash.digest("hex") !== sha256)
                  fail(`${label}: source size/checksum changed during upload`);
                complete = true;
                stream.close();
                return;
              }
              const bytes =
                value instanceof Uint8Array ? value : new Uint8Array(value);
              sent += bytes.byteLength;
              if (sent > size) fail(`${label}: source grew during upload`);
              hash.update(bytes);
              stream.enqueue(bytes);
            } catch (error) {
              stream.error(error);
              await close();
            }
          },
          cancel: close,
        },
        { highWaterMark: 0 },
      );
      // NULL makes the file backend delete the entire key directory on upsert.
      // A fresh placeholder limits old-version cleanup to a nonexistent leaf.
      const initialVersion = randomUUID();
      await objectQuery(insert("objects", row, initialVersion));
      upload = await fetch(url, {
        method: "POST",
        body,
        duplex: "half",
        redirect: "error",
        signal: requestSignal,
        headers: {
          ...headers(target),
          "x-upsert": "true",
          "content-type": contentType,
          "cache-control": cacheControl,
          "content-length": String(size),
          "x-metadata": Buffer.from(JSON.stringify(row.user_metadata)).toString(
            "base64",
          ),
        },
      });
      requestSignal.throwIfAborted();
      if (!upload.ok || !complete)
        fail(
          `${label}: upload failed (HTTP ${upload.status}); target is partial`,
        );
      await cancel(upload.body);
      const saved = await verifyRow(objectQuery, "objects", row),
        metadata = saved.metadata;
      equal(saved.path_tokens, row.name.split("/"), `${label} generated path`);
      if (
        !saved.version ||
        saved.version === initialVersion ||
        saved.version === row.version ||
        !metadata?.eTag ||
        !metadata.lastModified ||
        Number(metadata.size ?? metadata.contentLength) !== size
      )
        fail(`${label}: target operational metadata verification failed`);
      equal(metadata.mimetype, contentType, `${label} MIME`);
      equal(metadata.cacheControl, cacheControl, `${label} cache-control`);
      const custom = Object.fromEntries(
        Object.entries(row.metadata).filter(([key]) => !operational.has(key)),
      );
      for (const [key, value] of Object.entries(custom))
        if (Object.hasOwn(metadata, key))
          equal(
            metadata[key],
            value,
            `${label} custom metadata collision ${key}`,
          );
      if (Object.keys(custom).length)
        await objectQuery(
          `UPDATE storage.objects SET metadata=metadata || ${sqlValue(custom, "metadata")} WHERE id=${quote(row.id)}`,
        );
      equal(
        (await verifyRow(objectQuery, "objects", row)).metadata,
        { ...metadata, ...custom },
        `${label} logical metadata`,
      );
      download = await fetch(
        url.replace("/object/", "/object/authenticated/"),
        {
          headers: { ...headers(target), "accept-encoding": "identity" },
          redirect: "error",
          signal: requestSignal,
        },
      );
      requestSignal.throwIfAborted();
      if (!download.ok || !download.body)
        fail(
          `${label}: verification download failed (HTTP ${download.status})`,
        );
      equal(
        await hashBody(download.body, requestSignal),
        { size, sha256 },
        `${label} downloaded bytes`,
      );
      equal(
        download.headers.get("content-type"),
        contentType.includes("text/html") ? "text/plain" : contentType,
        `${label} downloaded MIME`,
      );
      equal(
        download.headers.get("cache-control"),
        cacheControl,
        `${label} downloaded cache-control`,
      );
    } catch (error) {
      signal?.throwIfAborted();
      throw new Error(
        `${label}: Storage transfer failed; target may contain partial data. Keep the source, discard only this fresh target, and retry. ${error.message}`,
        { cause: error },
      );
    } finally {
      clearTimeout(timer);
      controller.abort();
      requestSignal.removeEventListener("abort", close);
      if (reader) {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      await cancel(upload?.body);
      await cancel(download?.body);
    }
  }
  for (const row of snapshot.buckets) await verifyRow(query, "buckets", row);
  await assertStorageUnchanged(app, snapshot);
  signal?.throwIfAborted();
  return {
    buckets: snapshot.buckets.length,
    objects: snapshot.objects.length,
    bytes: snapshot.objects.reduce((sum, object) => sum + object.size, 0),
  };
}
