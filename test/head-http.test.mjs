import test from 'node:test';
import assert from 'node:assert/strict';
import {serve} from '@hono/node-server';
import {harness} from './helpers/head.mjs';

test('Node loopback HTTP adapter preserves the intended successful HEAD headers and GET bytes',async()=>{
  const servers=[]; const hs=[];
  try {
    for(const flavor of ['baseline','candidate']) {
      const h=await harness(flavor);hs.push(h);
      const server=serve({fetch:request=>h.app.fetch(request),hostname:'127.0.0.1',port:0});
      servers.push(server);
      if(!server.listening)await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject)});
    }
    const response=async(index,method,headers,query)=>{
      const r=await fetch(`http://127.0.0.1:${servers[index].address().port}/rest/v1/head_docs?${query}`,{method,headers});
      const clean=Object.fromEntries(r.headers);
      delete clean.date;delete clean.connection;delete clean['keep-alive'];
      return {status:r.status,headers:clean,body:await r.text()};
    };
    for(const [accept,query,status] of [
      ['application/json','select=id,label,body&limit=2',206],
      ['text/csv','select=id,label,body&limit=2',206],
      ['application/vnd.pgrst.object+json','select=id,label&id=eq.1',200],
      ['application/vnd.pgrst.object+json','select=id&limit=2',406],
      ['application/json','select=id&offset=7',416],
    ]) {
      const headers={accept,prefer:'count=exact'};
      const bGet=await response(0,'GET',headers,query),cGet=await response(1,'GET',headers,query);
      assert.deepEqual(cGet,bGet);assert.equal(cGet.status,status);
      const bHead=await response(0,'HEAD',headers,query),cHead=await response(1,'HEAD',headers,query);
      if(status<300){assert.ok(bHead.headers['content-length']);delete bHead.headers['content-length'];assert.equal(cHead.headers['content-length'],undefined)}
      assert.deepEqual(cHead,bHead);assert.equal(cHead.body,'');assert.equal(cHead.status,status);
    }
  }finally {
    for(const server of servers){server.closeAllConnections();await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
    for(const h of hs)await h.close();
  }
});
