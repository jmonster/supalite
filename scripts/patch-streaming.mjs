import assert from "node:assert/strict";
import { createHash } from "node:crypto";

export const cliSha256 = "b4646e383c5de5962afb49adbb4eb20ac6b58bef17c64c5a7c7e80d731178600";
export function patchStreaming(source) {
  assert.equal(createHash("sha256").update(source).digest("hex"), cliSha256,
    "Refusing to patch an unrecognized Lite CLI");
  const replace = (before, after) => {
    assert.equal(source.split(before).length - 1, 1, `Expected exactly one streaming seam: ${before}`);
    source = source.replace(before, after);
  };
  replace('#!/usr/bin/env node\n', '#!/usr/bin/env node\nimport { isNodeSqlite, upgradeRows, beginReadSnapshot, disposeUserData, sqlBatches } from "./sqlite-streaming.js";\n');
  // Readiness: same validators and diagnostic arrays, incremental input.
  replace('let m=(await e.connection.exec(`SELECT ${f} FROM ${a}`))?.rows??[];for(let d of m)',
    'for await(let d of upgradeRows(e.connection,`SELECT ${f} FROM ${a}`))');
  // Audit: keep exact result fields and capped samples; include iteration errors
  // in the existing scan-failure report, not only statement preparation errors.
  const auditStart = source.indexOf('async function qT(e,t)');
  const auditEnd = source.indexOf('function Nc(e)', auditStart);
  let audit = source.slice(auditStart, auditEnd);
  const queryStart = audit.indexOf(',l;try{l=await');
  const catchStart = audit.indexOf('catch(d){return ', queryStart);
  const scanStart = audit.indexOf('let c=l?.rows??[]', catchStart);
  const loopStart = audit.indexOf('for(let d of c)', scanStart);
  const resultStart = audit.indexOf('return {field:kc(t)', loopStart);
  assert.ok(queryStart > 0 && catchStart > queryStart && scanStart > catchStart && resultStart > loopStart);
  const failure = audit.slice(catchStart, scanStart);
  const initialization = audit.slice(scanStart, loopStart).replace('let c=l?.rows??[],', 'let c=0,');
  const loop = audit.slice(loopStart, resultStart).replace('for(let d of c){', 'for await(let d of upgradeRows(e.connection,`SELECT ${a} FROM ${r}`)){c++;');
  const result = audit.slice(resultStart).replace('rows_checked:c.length', 'rows_checked:c');
  const changedAudit = audit.slice(0, queryStart) + ';' + initialization + 'try{' + loop + '}' + failure + result;
  replace(audit, changedAudit);
  // The native path counts and streams within one owned/borrowed read snapshot.
  // Keep original FK, field, formatter, identity and reset code as single seams.
  replace('async function co(e,t){let n=',
    'async function co(e,t,upgradeOptions={}){let snapshot=isNodeSqlite(e.connection)?beginReadSnapshot(e.connection,upgradeOptions):null;try{let n=');
  replace('h=(await e.connection.exec(`SELECT * FROM ${c}`))?.rows??[];',
    'h=snapshot?snapshot.rows(`SELECT * FROM ${c}`):(await e.connection.exec(`SELECT * FROM ${c}`))?.rows??[];');
  replace('catch{continue}if(h.length===0)continue;',
    'catch(error){if(snapshot)throw error;continue}if(h.length===0)continue;');
  replace('h=h.map(x=>{let $=u?u.deserializeRow(x):x;return m($)});',
    'let decodeRow=x=>{let $=u?u.deserializeRow(x):x;return m($)};if(!snapshot)h=h.map(decodeRow);');
  const exportLoopStart = source.indexOf('y=[];for(let x of h){let $=d.map(C=>Oh(x[C],g.get(C)));y.push(');
  const exportLoopEnd = source.indexOf('let _=f.filter', exportLoopStart);
  assert.ok(exportLoopStart > 0 && exportLoopEnd > exportLoopStart);
  const originalLoop = source.slice(exportLoopStart, exportLoopEnd);
  const generate = originalLoop.replace('y=[];for(let x of h){', 'generate=async function*(){for await(let raw of h){let x=snapshot?decodeRow(raw):raw;')
    .replace('y.push(', 'yield (').replace(');}', ');}}');
  replace(originalLoop, generate + ',y=snapshot?snapshot.statements(h.length,generate):[];if(!snapshot)for await(let statement of generate())y.push(statement);');
  replace('o.push({schema:l,table:a.name,inserts:y,sequenceResets:_});}return o}',
    'o.push({schema:l,table:a.name,inserts:y,sequenceResets:_});}return snapshot?snapshot.attach(o):o}catch(error){await disposeUserData(snapshot,error);throw error}}');
  // Rehearsal consumes one SQL statement at a time, preserving labels/counts.
  replace('let h=await co(e,t);for(let m of h){for(let d=0;d<m.inserts.length;d++){l++;try{await r.exec(m.inserts[d]);}catch(g){s.push({phase:"data",label:`${m.schema}.${m.table} row ${d+1}/${m.inserts.length}`,statement:m.inserts[d],error:String(g)});}}',
    'let h=await co(e,t);let dataError;try{for(let m of h){let d=0;for await(let statement of m.inserts){l++;d++;try{await r.exec(statement);}catch(g){s.push({phase:"data",label:`${m.schema}.${m.table} row ${d}/${m.inserts.length}`,statement,error:String(g)});}}');
  replace('statement:m.sequenceResets[d],error:String(g)});}}}finally{await r.close()',
    'statement:m.sequenceResets[d],error:String(g)});}}}catch(error){dataError=error;throw error}finally{await disposeUserData(h,dataError)}}finally{await r.close()');
  // Only native Node application SQL is bounded here. Auth and legacy
  // adapter arrays retain the shipped batching/failure/progress behavior.
  replace('let i=await Kh(e,n,{sizes:s.sizes??r.batchSizes,onProgress:(o,a)=>r.onBatchProgress?.(t,o,a)});',
    'let i=[];if(Array.isArray(n)){i=await Kh(e,n,{sizes:s.sizes??r.batchSizes,signal:r.signal,onProgress:(o,a)=>r.onBatchProgress?.(t,o,a)});}else{let done=0;for await(let batch of sqlBatches(n)){i.push(...await Kh(e,batch,{sizes:s.sizes??r.batchSizes,signal:r.signal,onProgress:o=>r.onBatchProgress?.(t,done+o,n.length)}));done+=batch.length;}}');
  replace('let a=await co(e,n),l=a.filter(c=>c.inserts.length>0);',
    'let a=await co(e,n,{signal:r.signal});let dataError;try{let l=a.filter(c=>c.inserts.length>0);');
  replace('for(let c of l)await Nn(t,`Resetting', 'await disposeUserData(a);for(let c of l)await Nn(t,`Resetting');
  replace('return {schemaStatements:n.statements.length,auth:o,dataTables:a}}',
    'return {schemaStatements:n.statements.length,auth:o,dataTables:a}}catch(error){dataError=error;throw error}finally{await disposeUserData(a,dataError)}}');
  // The existing spinner swallows process signals unless onCancel exits.
  // Its callback does not receive a signal name; use the CLI cancellation code.
  replace('async function Lc(e,t,n,r){',
    'function createUpgradeSpinner(){let controller=new AbortController;return Object.assign(hc({onCancel:()=>{controller.abort(new Error("Upgrade cancelled"));process.exit(130)}}),{signal:controller.signal})}async function Lc(e,t,n,r){r.signal?.throwIfAborted();');
  replace('let w=hc(),S,I;', 'let w=createUpgradeSpinner(),S,I;');
  replace('x=hc();x.start("Creating Supabase project")',
    'x=createUpgradeSpinner();x.start("Creating Supabase project")');
  // The CLI exit wrapper can await telemetry. Abort the actual pipeline first,
  // and never turn cancellation into retry attempts or per-row diagnostics.
  replace('syncAuthConfig:!1,onSql:(H,ne)=>', 'syncAuthConfig:!1,signal:w.signal,onSql:(H,ne)=>');
  replace('migrateSessions:y,authTarget:"supabase",onSql:(R,F)=>',
    'migrateSessions:y,authTarget:"supabase",signal:x.signal,onSql:(R,F)=>');
  replace('async function GT(e,t,n,r){r.onSql?.(t,n);try{await e.runSql(t);}catch(s){',
    'async function GT(e,t,n,r){r.signal?.throwIfAborted();r.onSql?.(t,n);r.signal?.throwIfAborted();try{await e.runSql(t);r.signal?.throwIfAborted();}catch(s){r.signal?.throwIfAborted();');
  replace('async function Nn(e,t,n,r,s={}){if(n.length===0)return;',
    'async function Nn(e,t,n,r,s={}){r.signal?.throwIfAborted();if(n.length===0)return;');
  replace('try{await e.runSql(u);}catch(f){s.push({statement:u,error:String(f)});}',
    'n.signal?.throwIfAborted();try{await e.runSql(u);n.signal?.throwIfAborted();}catch(f){n.signal?.throwIfAborted();s.push({statement:u,error:String(f)});}');
  replace('try{await e.runSql(h),i+=f.length,n.onProgress?.(i,o);}catch{await a(f,c+1);}',
    'n.signal?.throwIfAborted();try{await e.runSql(h);n.signal?.throwIfAborted();i+=f.length,n.onProgress?.(i,o);}catch(error){n.signal?.throwIfAborted();await a(f,c+1);}');
  replace('await t.updateAuthConfig(c),r.onAuthConfigEnd?.()',
    'await t.updateAuthConfig(c),r.signal?.throwIfAborted(),r.onAuthConfigEnd?.()');
  replace('return {schemaStatements:n.statements.length,auth:o,dataTables:a}}catch(error)',
    'r.signal?.throwIfAborted();return {schemaStatements:n.statements.length,auth:o,dataTables:a}}catch(error)');
  replace('if(i.length>0)throw r.onBatchFailure?.(t,i)',
    'r.signal?.throwIfAborted();if(i.length>0)throw r.onBatchFailure?.(t,i)');
  replace('r.onSchemaEnd?.(n.statements.length);let i=await ro(e,',
    'r.onSchemaEnd?.(n.statements.length);r.signal?.throwIfAborted();let i=await ro(e,');
  replace('r.onAuthConfigStart?.(),await t.updateAuthConfig(c)',
    'r.signal?.throwIfAborted(),r.onAuthConfigStart?.(),r.signal?.throwIfAborted(),await t.updateAuthConfig(c)');
  return source;
}
