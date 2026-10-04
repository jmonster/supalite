import nodeTest from "node:test";
// Native Node SQLite is required here; Bun's supported legacy path has its own tests.
const test = process.versions.bun ? nodeTest.skip : nodeTest;
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const root = new URL("../upstream/lite-0.11.0/", import.meta.url);
const bridge = new URL("dist/cli/index.js", root);

for (const signal of ["SIGINT", "SIGTERM"]) {
  test(`${signal}: actual apply spinner cancellation exits130, releases source, and cannot retract accepted target SQL`, {
    skip: process.platform === "win32" ? "POSIX process signals" : false,
  }, async t => {
    const directory = await mkdtemp(join(tmpdir(), "lite-direct-apply-cancel-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const path = join(directory, "source.db");
    const db = new DatabaseSync(path);
    db.exec("CREATE TABLE records (id integer PRIMARY KEY,label text)");
    const insert = db.prepare("INSERT INTO records VALUES (?,?)");
    for (let i = 1; i <= 125; i++) insert.run(i, `row${i}`);
    db.close();
    const childPath = join(directory, "apply.mjs");
    const connectionUrl = new URL("dist/db/node/index.js", root).href;
    await writeFile(childPath, `
      import {runUpgrade as apply,createUpgradeSpinner,installCliProcessHandlers} from ${JSON.stringify(bridge.href)};
      import {createConnection} from ${JSON.stringify(connectionUrl)};
      const connection=createConnection({url:${JSON.stringify(path)}});
      const ddl='CREATE TABLE records (id integer PRIMARY KEY,label text)';
      const schema={sql:ddl,files:[{filename:'fixture.sql',sql:ddl}],statements:[{file:'fixture.sql',index:1,total:1,sql:ddl}]};
      installCliProcessHandlers();
      const spinner=createUpgradeSpinner();
      await apply({connection,config:{auth:{enabled:false}}},{runSql:async sql=>{
        if(sql.startsWith('INSERT INTO "public".')) {
          process.send({acceptedSql:sql,sourceTransaction:connection.driver.isTransaction});
          await new Promise(()=>{});
        }
      }},schema,{migrateSessions:false,syncAuthConfig:false,signal:spinner.signal,
        onSchemaStart:()=>spinner.start('Applying schema'),onSchemaEnd:()=>spinner.stop('Schema applied'),
        onBatchStart:label=>spinner.start(label),onBatchProgress:()=>{},onBatchEnd:label=>spinner.stop(label)
      });
      console.log('UNEXPECTED_APPLY_COMPLETED');
      await connection.close();
    `);
    const child = spawn(process.execPath, [childPath], { env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0", CI: "true" }, stdio: ["ignore", "pipe", "pipe", "ipc"] });
    t.after(() => { if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL"); });
    let stdout = "", stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    const finished = once(child, "exit");
    const message = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Apply did not reach target wait: ${stdout}\n${stderr}`)), 10000);
      child.once("message", message => { clearTimeout(timeout); resolve(message); });
      child.once("exit", () => { clearTimeout(timeout); reject(new Error(`Apply exited too soon: ${stdout}\n${stderr}`)); });
    });
    assert.equal(message.sourceTransaction, true);
    const other = new DatabaseSync(path);
    t.after(() => other.close());
    other.exec("PRAGMA busy_timeout=1");
    assert.throws(() => other.exec("BEGIN EXCLUSIVE"), /locked/);
    child.kill(signal);
    const timeout = setTimeout(() => child.kill("SIGKILL"), 5000);
    const [code, deliveredSignal] = await finished;
    clearTimeout(timeout);
    assert.equal(code, 130, stderr);
    assert.equal(deliveredSignal, null, "Explicit cancellation status, not guessed signal identity");
    assert.doesNotMatch(stdout, /UNEXPECTED_APPLY_COMPLETED/);
    assert.doesNotMatch(stderr, /ProcessExit|uncaughtException/);
    other.exec("BEGIN EXCLUSIVE; ROLLBACK");
    assert.equal(other.prepare("SELECT count(*) AS n FROM records").get().n, 125);
    // This test process is an independently surviving synthetic sink. A request
    // accepted before cancellation can still finish after the client has exited.
    const target = new DatabaseSync(":memory:");
    try {
      target.exec("CREATE TABLE records (id integer PRIMARY KEY,label text)");
      target.exec(message.acceptedSql.replaceAll('"public".', ""));
      assert.equal(target.prepare("SELECT count(*) AS n FROM records").get().n, 50);
    } finally { target.close(); }
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) for (const sinkRejects of [false, true]) {
  test(`${signal}: delayed telemetry flush fences a ${sinkRejects ? "rejecting" : "successful"} in-flight batch without retries or false completion`, {
    skip: process.platform === "win32" ? "POSIX process signals" : false,
  }, async t => {
    const directory = await mkdtemp(join(tmpdir(), "lite-direct-flush-cancel-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const path = join(directory, "source.db");
    const db = new DatabaseSync(path);
    db.exec("CREATE TABLE records (id integer PRIMARY KEY,label text)");
    const insert = db.prepare("INSERT INTO records VALUES (?,?)");
    for (let i = 1; i <= 125; i++) insert.run(i, `row${i}`);
    db.close();
    const childPath = join(directory, "apply.mjs");
    await writeFile(childPath, `
      import {runUpgrade as apply,createUpgradeSpinner,installCliProcessHandlers} from ${JSON.stringify(bridge.href)};
      import {createConnection} from ${JSON.stringify(new URL("dist/db/node/index.js", root).href)};
      import {DatabaseSync} from 'node:sqlite';
      const connection=createConnection({url:${JSON.stringify(path)}});
      const target=new DatabaseSync(':memory:');
      const ddl='CREATE TABLE records (id integer PRIMARY KEY,label text)';
      const schema={sql:ddl,files:[{filename:'fixture.sql',sql:ddl}],statements:[{file:'fixture.sql',index:1,total:1,sql:ddl}]};
      let calls=0,ends=0,failures=0,progress=0;
      installCliProcessHandlers({flush:async ()=>{
        const timeout=2000;
        console.log('FLUSH_STATE:'+JSON.stringify({timeout,transaction:connection.driver.isTransaction}));
        await new Promise(resolve=>setTimeout(resolve,800));
        console.log('FLUSH_FINISHED');
      }});
      const spinner=createUpgradeSpinner();
      try {
        await apply({connection,config:{auth:{enabled:false}}},{runSql:async sql=>{
          if(sql.startsWith('INSERT INTO "public".')) {
            calls++;
            target.exec(sql.replaceAll('"public".',''));
            if(calls===1) {
              process.send({ready:true});
              await new Promise(resolve=>setTimeout(resolve,150));
              ${sinkRejects ? "throw new Error('in-flight target rejected');" : ""}
            }
          } else target.exec(sql);
        }},schema,{migrateSessions:false,syncAuthConfig:false,signal:spinner.signal,
          onSchemaStart:()=>spinner.start('Schema'),onSchemaEnd:()=>spinner.stop('Schema applied'),
          onBatchStart:label=>spinner.start(label),onBatchProgress:()=>progress++,
          onBatchEnd:()=>ends++,onBatchFailure:()=>failures++
        });
        console.log('UNEXPECTED_APPLY_COMPLETED');
      } catch(error) {
        console.log('CANCEL_RESULT:'+JSON.stringify({error:String(error),calls,ends,failures,progress,
          rows:target.prepare('SELECT count(*) AS n FROM records').get().n,
          transaction:connection.driver.isTransaction}));
      }
      target.close();await connection.close();
    `);
    const child = spawn(process.execPath, [childPath], { env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0", CI: "true" }, stdio: ["ignore", "pipe", "pipe", "ipc"] });
    t.after(() => { if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL"); });
    let stdout = "", stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    const finished = once(child, "exit");
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Target wait not reached: ${stdout}\n${stderr}`)), 10000);
      child.once("message", () => { clearTimeout(timeout); resolve(); });
      child.once("exit", () => { clearTimeout(timeout); reject(new Error(`Early exit: ${stdout}\n${stderr}`)); });
    });
    child.kill(signal);
    const timeout = setTimeout(() => child.kill("SIGKILL"), 5000);
    const [code, receivedSignal] = await finished;
    clearTimeout(timeout);
    assert.equal(code, 130, stderr); assert.equal(receivedSignal, null);
    assert.doesNotMatch(stdout, /UNEXPECTED_APPLY_COMPLETED/);
    const flush = JSON.parse(stdout.split("FLUSH_STATE:")[1].split("\n")[0]);
    assert.deepEqual(flush, { timeout: 2000, transaction: false }, "Abort releases source before telemetry starts waiting");
    const result = JSON.parse(stdout.split("CANCEL_RESULT:")[1].split("\n")[0]);
    assert.match(result.error, /Upgrade cancelled/);
    assert.deepEqual({ ...result, error: undefined }, { error: undefined, calls: 1, ends: 0, failures: 0, progress: 0, rows: 50, transaction: false });
    assert.ok(stdout.indexOf("CANCEL_RESULT:") < stdout.indexOf("FLUSH_FINISHED"), "Pending apply must reject before deferred process exit");
    const other = new DatabaseSync(path);
    try { other.exec("PRAGMA busy_timeout=1; BEGIN EXCLUSIVE; ROLLBACK"); }
    finally { other.close(); }
  });
}
