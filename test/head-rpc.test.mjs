import test from "node:test";
import assert from "node:assert/strict";
import { createHarness } from "./helpers/lite.mjs";
import { request } from "./helpers/head.mjs";

async function pgHarness(flavor) {
  const h = await createHarness({ flavor, backend: "pglite" });
  const { connection } = h;
  await connection.exec(`
    CREATE TABLE head_docs(id integer primary key,label text,body jsonb,nullable text);
    INSERT INTO head_docs VALUES
      (1,E'é🙂,quote"\nline','{"nested":{"x":null},"a":[1,null,"é🙂"]}',NULL),
      (2,'second','null','present');
    CREATE VIEW head_view AS SELECT * FROM head_docs;
    CREATE FUNCTION head_scalar() RETURNS integer LANGUAGE sql STABLE AS $$ SELECT 7 $$;
    CREATE FUNCTION head_set() RETURNS SETOF head_docs LANGUAGE sql STABLE AS $$ SELECT * FROM head_docs ORDER BY id $$;
    CREATE FUNCTION head_json() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{"hello":"é🙂","nil":null}'::jsonb $$;
    CREATE FUNCTION head_void() RETURNS void LANGUAGE sql STABLE AS $$ SELECT NULL::void $$;
    CREATE FUNCTION head_fails() RETURNS integer LANGUAGE sql STABLE AS $$ SELECT 1/0 $$;
  `);
  return h;
}

function successfulHeadExpected(baseline) {
  assert.ok(baseline.status >= 200 && baseline.status < 300,JSON.stringify(baseline));
  const expected=structuredClone(baseline); delete expected.headers['content-length'];
  return expected;
}

test('PGlite: real table/view HEAD optimized, all RPC success/error paths unchanged',async t=>{
  const hs={baseline:await pgHarness('baseline'),candidate:await pgHarness('candidate')};
  const oldError=console.error;console.error=()=>{};
  try{
    for(const relation of ['head_docs','head_view'])for(const [format,headers] of [
      ['json',{}],['csv',{accept:'text/csv'}],
      ['stripped',{accept:'application/vnd.pgrst.array+json;nulls=stripped'}],
      ['singular',{accept:'application/vnd.pgrst.object+json'}],
    ])await t.test(`${relation}/${format}`,async()=>{
      const search='select=id,label,body,nullable&id=eq.1';
      const b=await request(hs.baseline,search,headers,'HEAD',relation);
      const c=await request(hs.candidate,search,headers,'HEAD',relation);
      assert.equal(c.status,200);assert.deepEqual(c,successfulHeadExpected(b));
      const bGet=await request(hs.baseline,search,headers,'GET',relation);
      const cGet=await request(hs.candidate,search,headers,'GET',relation);
      assert.deepEqual(cGet,bGet);assert.equal(cGet.status,200);
    });
    for(const [fn,headers,status] of [
      ['head_scalar',{},200],['head_json',{},200],['head_void',{},204],
      ['head_set',{},200],['head_set',{accept:'text/csv'},200],
      ['head_set',{accept:'application/vnd.pgrst.array+json;nulls=stripped'},200],
      ['head_set',{accept:'application/vnd.pgrst.object+json'},406],
      ['head_fails',{},400],
    ])await t.test(`RPC ${fn} ${JSON.stringify(headers)}`,async()=>{
      for(const method of ['GET','HEAD']) {
        const b=await request(hs.baseline,'',headers,method,'rpc/'+fn);
        const c=await request(hs.candidate,'',headers,method,'rpc/'+fn);
        assert.deepEqual(c,b);assert.equal(c.status,status,JSON.stringify(c));
        if(method==='HEAD')assert.equal(c.body,'');
        if(status===200)assert.ok(c.headers['content-length']);
      }
    });
  }finally{console.error=oldError;await hs.baseline.close();await hs.candidate.close();}
});
