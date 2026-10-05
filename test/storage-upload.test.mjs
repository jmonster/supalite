import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, mkdir, open, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FileSystemStorageAdapter } from "../upstream/lite-0.11.0/dist/cli/index.js";
import { createApi } from "../upstream/lite-0.11.0/dist/cli/lib.js";

const md5 = bytes => `"${createHash("md5").update(bytes).digest("hex")}"`;
const chunk = Buffer.alloc(65536, 7);
const adapters = [["CLI", FileSystemStorageAdapter]];
test.before(async () => {
  // Obtain the other shipped adapter through its real application factory.
  const { createConnection } = await import(`../upstream/lite-0.11.0/dist/db/${process.versions.bun ? "bun" : "node"}/index.js`);
  const connection = await createConnection({ url: ":memory:" });
  const original = process.env.EXPERIMENTAL_STORAGE;
  process.env.EXPERIMENTAL_STORAGE = "1";
  try {
    const api = await createApi({ withSupabaseClient: false, authStorage: {} });
    api.project.local.getConfig = async () => ({ connection, auth: { enabled: false }, storage: { enabled: true }, options: { server: { admin: false, disableStudio: true } } });
    adapters.push(["library", (await api.project.local.createApp())._storageAdapter.constructor]);
  } finally {
    if (original === undefined) delete process.env.EXPERIMENTAL_STORAGE;
    else process.env.EXPERIMENTAL_STORAGE = original;
    await connection.close();
  }
});

async function fixture(t, Adapter) {
  const root = await mkdtemp(join(tmpdir(), "lite-upload-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const adapter = new Adapter({ basePath: root });
  const destination = join(root, "bucket", "file.bin");
  await mkdir(join(root, "bucket"));
  return { root, destination, adapter, upload: body => adapter.uploadObject("bucket", "file.bin", undefined, body, "application/custom", "123") };
}

// Wrapping actual FileHandle write streams keeps fault injection local to this test file.
async function writeStreamHook(t, wrap, before = () => {}) {
  const file = await open(new URL(import.meta.url), "r");
  const prototype = Object.getPrototypeOf(file);
  const original = prototype.createWriteStream;
  await file.close();
  prototype.createWriteStream = function (options) { before(this); return wrap(original.call(this, options), this); };
  t.after(() => { prototype.createWriteStream = original; });
}

for (const index of [0, 1]) {
  test(`${index ? "library" : "CLI"}: filesystem upload bytes, metadata, empty content and atomic replacement`, async t => {
    const [, Adapter] = adapters[index];
    const { root, destination, adapter, upload } = await fixture(t, Adapter);
    for (const [expected, stream] of [[Buffer.from("buffer"), false], [new Uint8Array([0, 1, 128, 255]), false], [chunk, true], [Buffer.alloc(0), true]]) {
      const source = stream ? new ReadableStream({ start(c) { c.enqueue(expected.subarray(0, 19)); c.enqueue(expected.subarray(19)); c.close(); } }) : expected;
      const metadata = await upload(source);
      assert.deepEqual(await readFile(destination), Buffer.from(expected));
      assert.deepEqual(metadata, { cacheControl: "123", contentLength: expected.length, size: expected.length, mimetype: "application/custom", lastModified: (await stat(destination)).mtime, eTag: md5(expected) });
      if (!(source instanceof Uint8Array)) assert.equal(source.locked, false);
      assert.deepEqual(await readdir(join(root, "bucket")), ["file.bin"]);
    }
    await chmod(destination, 0o600);
    await upload(Buffer.from("private replacement"));
    if (process.platform !== "win32") assert.equal((await stat(destination)).mode & 0o777, 0o600);
    await adapter.uploadObject("bucket", "x".repeat(255), undefined, Buffer.alloc(0), "text/plain", "1");
  });

  for (const failure of ["source", "setup", "write", "close"]) {
    test(`${index ? "library" : "CLI"}: ${failure} failure preserves prior bytes and cleans staging`, async t => {
      const [, Adapter] = adapters[index];
      const { root, destination, upload } = await fixture(t, Adapter);
      await writeFile(destination, "old bytes");
      const error = new Error(`injected ${failure} failure`);
      let cancelled = false, pulls = 0;
      if (failure !== "source") await writeStreamHook(t, (stream, file) => {
        if (failure === "write") stream._write = (_chunk, _encoding, callback) => callback(error);
        else {
          const close = file.close.bind(file);
          let first = true;
          file.close = async () => { await close(); if (first) { first = false; throw error; } };
        }
        return stream;
      }, () => { if (failure === "setup") throw error; });
      const source = new ReadableStream({
        pull(c) {
          if (pulls++ === 0) c.enqueue(chunk);
          else if (failure === "source") c.error(error);
          else if (failure === "close") c.close();
          // A sink failure must cancel even a source waiting indefinitely for bytes.
          else return new Promise(() => {});
        },
        cancel() { cancelled = true; },
      });
      await assert.rejects(upload(source), /injected .* failure/);
      assert.equal(source.locked, false);
      if (failure === "write" || failure === "setup") assert.equal(cancelled, true);
      assert.equal(await readFile(destination, "utf8"), "old bytes");
      assert.deepEqual(await readdir(join(root, "bucket")), ["file.bin"]);
    });
  }

  test(`${index ? "library" : "CLI"}: rename/open failures clean only owned staging and cancel input`, async t => {
    const [, Adapter] = adapters[index];
    const { root, destination, upload } = await fixture(t, Adapter);
    await mkdir(destination);
    await writeFile(join(destination, "keep"), "old bytes");
    await assert.rejects(upload(chunk), /EISDIR|ENOTEMPTY|EEXIST/);
    assert.equal(await readFile(join(destination, "keep"), "utf8"), "old bytes");
    assert.deepEqual(await readdir(join(root, "bucket")), ["file.bin"]);
    let cancelled = false;
    const source = new ReadableStream({ cancel() { cancelled = true; } });
    const adapter = new Adapter({ basePath: join(destination, "keep") });
    await assert.rejects(adapter.uploadObject("bucket", "file", undefined, source, "text/plain", "1"), /ENOTDIR|EEXIST/);
    assert.equal(cancelled, true);
    assert.equal(source.locked, false);
    if (process.platform !== "win32" && process.getuid?.() !== 0) {
      await chmod(join(root, "bucket"), 0o555);
      let openCancelled = false;
      try {
        await assert.rejects(upload(new ReadableStream({ cancel() { openCancelled = true; } })), /EACCES/);
        assert.equal(openCancelled, true);
      } finally { await chmod(join(root, "bucket"), 0o755); }
    }
    const locked = new ReadableStream();
    const reader = locked.getReader();
    try { await assert.rejects(upload(locked), /lock/i); }
    finally { reader.releaseLock(); }
    assert.deepEqual(await readdir(join(root, "bucket")), ["file.bin"]);
  });

  test(`${index ? "library" : "CLI"}: writes before source EOF with bounded slow-sink read-ahead`, async t => {
    const [, Adapter] = adapters[index];
    const { upload } = await fixture(t, Adapter);
    let produced = 0, completed = 0, ahead = 0, firstProgressAt;
    await writeStreamHook(t, stream => {
      for (const method of ["_write", "_writev"]) {
        const original = stream[method];
        stream[method] = function (...args) {
          const bytes = method === "_write" ? args[0].length : args[0].reduce((n, value) => n + value.chunk.length, 0);
          const callback = args.pop();
          setTimeout(() => original.call(this, ...args, error => { if (!error) { completed += bytes; firstProgressAt ??= produced; } callback(error); }), 2);
        };
      }
      return stream;
    });
    const total = 64 * chunk.length;
    const source = new ReadableStream({ pull(c) { if (produced === total) c.close(); else { produced += chunk.length; ahead = Math.max(ahead, produced - completed); c.enqueue(chunk); } } });
    const metadata = await upload(source);
    assert.equal(metadata.size, total);
    assert.ok(firstProgressAt < total, "destination must progress before EOF");
    assert.ok(ahead <= 10 * chunk.length, `queued ${ahead} bytes behind a slow sink`);
  });

  test(`${index ? "library" : "CLI"}: stalled writes bound queued empty chunks`, async t => {
    const [, Adapter] = adapters[index];
    const { destination, upload } = await fixture(t, Adapter);
    let release, entered, emptyWrites = 0;
    const started = new Promise(resolve => { entered = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    await writeStreamHook(t, stream => {
      const write = stream.write;
      stream.write = function (value, ...args) { if (value.byteLength === 0) emptyWrites++; return write.call(this, value, ...args); };
      for (const method of ["_write", "_writev"]) {
        const original = stream[method];
        stream[method] = function (...args) { entered(); gate.then(() => original.apply(this, args)); };
      }
      return stream;
    });
    let nonempty = 0, empty = 0, eof = false;
    const source = new ReadableStream({ pull(c) {
      if (nonempty < 4) { nonempty++; c.enqueue(chunk); }
      else if (empty < 10000) { empty++; c.enqueue(new Uint8Array(0)); }
      else { eof = true; c.close(); }
    } });
    const result = upload(source);
    let metadata;
    try {
      await Promise.race([started, result.then(() => { throw new Error("upload completed before staged write"); })]);
      await new Promise(resolve => setTimeout(resolve, 20));
      assert.equal(eof, false);
      assert.ok(empty <= 5, `queued ${empty} empty chunks behind a stalled write`);
    } finally { release(); metadata = await result; }
    const expected = Buffer.alloc(4 * chunk.length, 7);
    assert.equal(metadata.eTag, md5(expected));
    assert.deepEqual(await readFile(destination), expected);
    assert.equal(emptyWrites, 0);
  });

  // Bun uses native descriptor writes rather than these Node FileHandle hooks.
  if (!process.versions.bun) test(`${index ? "library" : "CLI"}: native write stream retries partial writes`, async t => {
    const [, Adapter] = adapters[index];
    const { destination, upload } = await fixture(t, Adapter);
    let shortWrites = 0, shortVectors = 0;
    await writeStreamHook(t, (stream, file) => {
      const write = file.write.bind(file), writev = file.writev.bind(file);
      file.write = (buffer, offset, length, position) => { shortWrites++; return write(buffer, offset, Math.min(length, 16384), position); };
      file.writev = async (buffers, position) => { shortVectors++; const result = await writev([buffers[0].subarray(0, 16384)], position); return { ...result, buffers }; };
      return stream;
    });
    const expected = Buffer.alloc(8 * chunk.length, 89);
    const source = new ReadableStream({ start(c) { for (let n = 0; n < expected.length; n += chunk.length) c.enqueue(expected.subarray(n, n + chunk.length)); c.close(); } });
    assert.equal((await upload(source)).eTag, md5(expected));
    assert.deepEqual(await readFile(destination), expected);
    assert.ok(shortWrites > 1 && shortVectors > 1);
  });

  test(`${index ? "library" : "CLI"}: concurrent replacements never mix writers`, async t => {
    const [, Adapter] = adapters[index];
    const { root, destination, upload } = await fixture(t, Adapter);
    const values = [Buffer.alloc(1024 * 1024, 17), Buffer.alloc(1024 * 1024, 99)];
    await writeFile(destination, "old");
    let running = true;
    const writes = Promise.all(values.map(bytes => upload(new ReadableStream({ start(c) { for (let n = 0; n < bytes.length; n += 65536) c.enqueue(bytes.subarray(n, n + 65536)); c.close(); } })))).finally(() => { running = false; });
    while (running) { const bytes = await readFile(destination); assert.ok(bytes.equals(Buffer.from("old")) || values.some(value => bytes.equals(value))); }
    const results = await writes;
    assert.deepEqual(results.map(value => value.eTag), values.map(md5));
    const final = await readFile(destination);
    assert.ok(values.some(value => value.equals(final)));
    assert.deepEqual(await readdir(join(root, "bucket")), ["file.bin"]);
  });
}
