import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {cpus} from 'node:os';
import {harness} from '../test/helpers/head.mjs';
const samples=20,warmups=4;
const results=[];
const median=xs=>{const a=[...xs].sort((x,y)=>x-y);return (a[(a.length-1)>>1]+a[a.length>>1])/2};
for(const backend of ['node','libsql']){
 const hs={baseline:await harness('baseline',backend),candidate:await harness('candidate',backend)};
 try{
  for(const h of Object.values(hs)){
   await h.connection.kysely.deleteFrom('head_docs').execute();
   for(let id=1;id<=1000;id++)await h.connection.kysely.insertInto('head_docs').values({id,label:'é🙂',body:JSON.stringify({active:true,notes:'x'.repeat(4096)}),nullable:null}).execute();
  }
  for(const [scenario,select,csv]of [['narrow-json-id','id',false],['narrow-csv-id','id',true],['wide-json-4KiB','id,body',false],['wide-csv-4KiB','id,body',true]]){
   const observations=[];
   const run=async(flavor)=>{
    let query=hs[flavor].client.from('head_docs').select(select,{head:true,count:'exact'}).contains('body',{active:true});
    if(csv)query=query.csv();
    const start=performance.now();const r=await query;const ms=performance.now()-start;
    assert.equal(r.error,null);assert.equal(r.data,null);assert.equal(r.count,1000);assert.equal(r.status,200);
    return ms;
   };
   for(let i=0;i<warmups;i++){await run('baseline');await run('candidate');}
   for(let pair=0;pair<samples;pair++){
    const order=pair%2?['candidate','baseline']:['baseline','candidate'];
    const row={pair,order};for(const flavor of order)row[flavor]=await run(flavor);observations.push(row);
   }
   const base=median(observations.map(r=>r.baseline)),candidate=median(observations.map(r=>r.candidate));
   const result={backend,scenario,rows:1000,baselineMedianMs:base,candidateMedianMs:candidate,ratio:base/candidate,reductionPct:100*(base-candidate)/base,medianPairedSavedMs:median(observations.map(r=>r.baseline-r.candidate)),samples:observations};
   results.push(result);console.log(JSON.stringify({...result,samples:undefined}));
  }
 }finally{await hs.baseline.close();await hs.candidate.close();}
}
const report={node:process.version,cpu:cpus()[0]?.model,package:'@supabase/lite@0.11.0',generatedAt:new Date().toISOString(),method:{warmupsPerFlavor:warmups,measuredPairs:samples,order:'baseline/candidate order alternates each pair',request:'real supabase-js HEAD + count=exact + shallow JSON contains',database:'separate identical in-memory databases; all1000 rows match; default limit1000',scope:'Only final JSON/CSV formatting and UTF-8 allocation are skipped. SQL and transformation work remains.',limitations:'Local Node SQLite and local libSQL only. No hosted network, D1 billing, PostgreSQL timing, or allocation profiler; microbenchmark is not a production-speedup guarantee.'},results};
await writeFile(new URL('../.generated/head-benchmark.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
