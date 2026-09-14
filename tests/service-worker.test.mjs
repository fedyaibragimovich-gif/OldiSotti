import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('public/sw.js','utf8');
function setup() {
 const listeners={};
 const shell=new Response('<html>offline shell</html>',{headers:{'content-type':'text/html'}});
 vm.runInNewContext(source,{
  self:{location:{origin:'https://example.com'},addEventListener:(name,fn)=>listeners[name]=fn},
  URL,Response,fetch:async()=>{throw new Error('offline');},
  caches:{open:async()=>({match:async key=>key==='/'?shell:undefined})}
 });
 return listeners;
}
test('offline script misses return an error instead of HTML',async()=>{
 let response;
 setup().fetch({request:{url:'https://example.com/assets/missing.js',method:'GET',mode:'cors'},respondWith:p=>response=p});
 assert.equal((await response).type,'error');
});
test('offline navigation can use the cached application shell',async()=>{
 let response;
 setup().fetch({request:{url:'https://example.com/?listing=phone',method:'GET',mode:'navigate'},respondWith:p=>response=p});
 assert.match(await (await response).text(),/offline shell/);
});
test('API calls bypass the service worker cache',()=>{
 let intercepted=false;
 setup().fetch({request:{url:'https://example.com/api/health',method:'GET'},respondWith:()=>intercepted=true});
 assert.equal(intercepted,false);
});
