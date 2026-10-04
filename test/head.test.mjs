import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {patch,replacements} from '../scripts/patch-head-response.mjs';
import {harness,request} from './helpers/head.mjs';

const cases=[
 ['plain','select=id&limit=2'],
 ['exact','select=id&limit=2',{prefer:'count=exact'}],
 ['planned','select=id&limit=2',{prefer:'count=planned'}],
 ['estimated','select=id&limit=2',{prefer:'count=estimated'}],
 ['unicode-wide-json','select=id,label,body&limit=3',{prefer:'count=exact'}],
 ['csv','select=id,label,body,nullable&limit=3',{accept:'text/csv',prefer:'count=exact'}],
 ['null-stripped','select=id,nullable&limit=2',{accept:'application/vnd.pgrst.array+json;nulls=stripped',prefer:'count=exact'}],
 ['empty','select=id&id=gt.100',{prefer:'count=exact'}],
 ['last-page','select=id&offset=4&limit=3',{prefer:'count=exact'}],
 ['offset-equals-total','select=id&offset=6&limit=2',{prefer:'count=exact'}],
 ['offset-past-total','select=id&offset=7&limit=2',{prefer:'count=exact'}],
 ['offset-no-count','select=id&offset=6&limit=2'],
 ['zero-limit','select=id&limit=0',{prefer:'count=exact'}],
 ['range-header','select=id',{range:'2-3','range-unit':'items',prefer:'count=exact'}],
 ['single-one','select=id,label&id=eq.1',{accept:'application/vnd.pgrst.object+json',prefer:'count=exact'}],
 ['single-stripped','select=id,nullable&id=eq.1',{accept:'application/vnd.pgrst.object+json;nulls=stripped'}],
 ['single-many','select=id&limit=2',{accept:'application/vnd.pgrst.object+json',prefer:'count=exact'}],
 ['single-zero','select=id&id=gt.100',{accept:'application/vnd.pgrst.object+json'}],
 ['bad-column','select=missing',{prefer:'count=exact'}],
 ['bad-order','select=id&order=missing.asc',{prefer:'count=exact'}],
 ['bad-filter','select=id&id=invalid.1'],
 ['json-path','select=id,body->notes&limit=2',{prefer:'count=exact'}],
 ['projection-runtime-error','select=label->missing&limit=2',{prefer:'count=exact'}],
];
const expectedStatuses={
 plain:200,exact:206,planned:206,estimated:206,'unicode-wide-json':206,csv:206,
 'null-stripped':206,empty:200,'last-page':206,'offset-equals-total':416,
 'offset-past-total':416,'offset-no-count':200,'zero-limit':206,'range-header':206,
 'single-one':200,'single-stripped':200,'single-many':406,'single-zero':406,
 'bad-column':500,'bad-order':500,'bad-filter':400,'json-path':206,'projection-runtime-error':500,
};
for(const backend of ['node','libsql'])test(`${backend}: GET unchanged; HEAD response and SDK contracts`,async t=>{
 const baseline=await harness('baseline',backend),candidate=await harness('candidate',backend);
 const oldError=console.error;console.error=()=>{};
 try{
  for(const [name,search,headers={}]of cases)await t.test(name,async()=>{
   // Preserve the published driver's existing error mapping.
   const expectedStatus=backend==='libsql'&&['bad-column','bad-order'].includes(name)?400:expectedStatuses[name];
   const bGet=await request(baseline,search,headers,'GET');
   const cGet=await request(candidate,search,headers,'GET');
   assert.equal(cGet.status,expectedStatus,'The intended success or error path must be exercised');
   assert.deepEqual(cGet,bGet,'GET bytes/status/headers must remain identical');
   const bHead=await request(baseline,search,headers);
   const cHead=await request(candidate,search,headers);
   assert.equal(cHead.status,expectedStatus);
   const expected=structuredClone(bHead);
   if(bHead.status>=200&&bHead.status<300){
    assert.ok('content-length'in bHead.headers);
    delete expected.headers['content-length'];
   }
   assert.deepEqual(cHead,expected,'Only successful HEAD Content-Length may differ');
   assert.equal(cHead.body,'');
  });
  await t.test('view',async()=>{
   const b=await request(baseline,'select=id&limit=2',{prefer:'count=exact'},'HEAD','head_view');
   const c=await request(candidate,'select=id&limit=2',{prefer:'count=exact'},'HEAD','head_view');
   assert.equal(c.status,206);
   delete b.headers['content-length'];assert.deepEqual(c,b);
  });
  await t.test('SDK contains, ranges, singular and errors',async()=>{
   const builders=[
    h=>h.client.from('head_docs').select('id',{head:true,count:'exact'}).contains('body',{active:true}).limit(2),
    h=>h.client.from('head_docs').select('id',{head:true,count:'exact'}).range(1,3),
    h=>h.client.from('head_docs').select('id',{head:true,count:'exact'}).eq('id',1).single(),
    h=>h.client.from('head_docs').select('id',{head:true,count:'exact'}).single(),
    h=>h.client.from('head_docs').select('id',{head:true,count:'exact'}).gt('id',100).maybeSingle(),
    h=>h.client.from('head_docs').select('missing',{head:true,count:'exact'}),
   ];
   for(const build of builders)assert.deepEqual(await build(candidate),await build(baseline));
  });
  await t.test('mutation representations unchanged',async()=>{
   const builders=[
    h=>h.client.from('head_docs').insert({id:7,label:'quoted, "value"',body:{active:true},nullable:null}).select(),
    h=>h.client.from('head_docs').update({label:'changed'}).eq('id',7).select().single(),
    h=>h.client.from('head_docs').delete().eq('id',7).select().csv(),
   ];
   for(const build of builders){const c=await build(candidate);assert.equal(c.error,null);assert.deepEqual(c,await build(baseline));}
  });
 }finally{console.error=oldError;await baseline.close();await candidate.close();}
});

for(const [name,search,accept,rows,expectedStatus]of [
 ['JSON array','select=id,label,body&limit=2','application/json',2,206],
 ['CSV','select=id,label,body&limit=2','text/csv',2,206],
 ['singular JSON','select=id,label,body&id=eq.1','application/vnd.pgrst.object+json',1,200],
 ['null-stripped JSON','select=id,label,body,nullable&limit=2','application/vnd.pgrst.array+json;nulls=stripped',2,206],
])test(`${name}: successful HEAD skips body formatting/encoding, retains query rows and transforms`,async()=>{
 const h=await harness('candidate');
 const oldStringify=JSON.stringify,oldEncode=TextEncoder.prototype.encode;
 const originalDeserialize=h.connection.deserializeRow.bind(h.connection);
 const originalPrepare=h.connection.driver.prepare.bind(h.connection.driver);
 const sql=[];let transformed=0,serialized=0,encoded=0;
 try{
  h.connection.deserializeRow=row=>{transformed++;return originalDeserialize(row)};
  h.connection.driver.prepare=query=>{
   const stmt=originalPrepare(query),all=stmt.all.bind(stmt);
   stmt.all=(...args)=>{const rows=all(...args);if(query.includes('from "head_docs"'))sql.push({query,rows:rows.length});return rows};return stmt;
  };
  JSON.stringify=function(value,...args){if((Array.isArray(value)&&value[0]?.id===1)||value?.id===1||typeof value?.notes==='string')serialized++;return oldStringify.call(this,value,...args)};
  TextEncoder.prototype.encode=function(value){if(typeof value==='string'&&(value.startsWith('[{"id":')||value.startsWith('{"id":')||value.startsWith('id,label')))encoded++;return oldEncode.call(this,value)};
  const headers={accept,prefer:'count=exact'};
  const head=await request(h,search,headers);
  assert.equal(head.status,expectedStatus);assert.equal(transformed,rows);assert.equal(serialized,0);assert.equal(encoded,0);
  assert.deepEqual(sql.map(x=>x.rows),[rows,1]);assert.match(sql[0].query,/select "id", "label", json\("body"\) as "body"/);assert.match(sql[1].query,/count\(\*\)/);
  assert.equal(head.headers['content-length'],undefined);
  assert.equal(head.body,'');
  const headQueries=structuredClone(sql);sql.length=0;
  const get=await request(h,search,headers,'GET');
  assert.equal(get.status,expectedStatus);assert.ok(serialized>0);assert.equal(encoded,1);
  assert.deepEqual(sql,headQueries,'HEAD must execute the same data and count queries as GET');
  assert.equal(Number(get.headers['content-length']),Buffer.byteLength(get.body));
 }finally{JSON.stringify=oldStringify;TextEncoder.prototype.encode=oldEncode;await h.close();}
});

test('HEAD retains row-transformation failures',async()=>{
 const baseline=await harness('baseline'),candidate=await harness('candidate');
 const oldError=console.error;console.error=()=>{};
 try{
  for(const h of [baseline,candidate])h.connection.deserializeRow=()=>{throw new Error('row transformation failed')};
  for(const accept of ['application/json','text/csv','application/vnd.pgrst.object+json']){
   const search='select=id&id=eq.1';
   const b=await request(baseline,search,{accept,prefer:'count=exact'});
   const c=await request(candidate,search,{accept,prefer:'count=exact'});
   assert.equal(c.status,500);assert.equal(c.body,'');assert.deepEqual(c,b);
  }
 }finally{console.error=oldError;await baseline.close();await candidate.close();}
});

test('patch anchors refuse changed or already-patched source',async()=>{
 const source=await readFile(new URL('../.generated/baseline/node_modules/@supabase/lite/dist/index.js',import.meta.url),'utf8');
 assert.throws(()=>patch(patch(source)),/exactly one/);
 assert.throws(()=>patch(source.replace('let wi=m?Io(Ln):vt(an)','let wi=other(an)')),/exactly one/);
});

test('only the two guarded HEAD response anchors differ',async()=>{
  const baseline=await readFile(new URL('../.generated/baseline/node_modules/@supabase/lite/dist/index.js',import.meta.url),'utf8');
  const candidate=await readFile(new URL('../.generated/candidate/node_modules/@supabase/lite/dist/index.js',import.meta.url),'utf8');
  assert.equal(createHash('sha256').update(baseline).digest('hex'),'f5cf75c6bcb10cec0c175cd4a8237b831368f7dbfc77e12652b965dde6a5685d');
  assert.equal(candidate,patch(baseline));
  assert.equal(replacements.length,2);
  let reverted=candidate;
  for(const {before,after} of replacements) {
    assert.equal(reverted.split(after).length,2);
    assert.match(after,/e\.type==="query"&&n\?\.head\?null:/);
    reverted=reverted.replace(after,before);
  }
  assert.equal(reverted,baseline);
});
