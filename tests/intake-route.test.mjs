import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {test} from 'node:test';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const {NextRequest,NextResponse}=require('next/server');
const source=readFileSync(new URL('../app/api/atendimento/lead/route.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture(upstream={ok:true,lead_id:10,slot:'B',responsible_user_id:102},status=200){
 const calls=[];const exp={};
 const CatalogSaleError=class CatalogSaleError extends Error { constructor(code){super(code);this.code=code;} };
 const modules={
  crypto:require('node:crypto'),'next/server':{NextRequest,NextResponse},
  '../../../lib/whatsapp/classifier':{isBlockedWholesale:s=>s.includes('atacado')?['atacado']:[]},
  '../../../lib/whatsapp/retail-gate':{COOKIE_RETAIL:'vlt_retail_ok',createRetailToken:()=> 'fixture-retail-token',retailCookieOptions:()=>({path:'/',httpOnly:true}),retailSecret:()=> 'fixture-secret'},
  '../../../lib/whatsapp/config':{ATTR_KEYS:['utm_source','gclid','ga_client_id','utm_referrer','client_id','_fbp','_fbc','fbp','fbc'],COOKIE_ASSIGNMENT:'vlt_wa_assignment',COOKIE_ASSIGNMENT_MAX_AGE:86400,COOKIE_ATTR:'vl_attr'},
  '../../../lib/whatsapp/store':{getRouteStore:()=>({assign:async opts=>{calls.push({action:'assign',opts});return {slot:'B',route_ref:'VLT-BFIXTURE'};}})},
  '../../../lib/whatsapp/routing':{parseAttrCookie:s=>{try{return JSON.parse(s||'{}')}catch{return{}}}},
  '../../../lib/whatsapp/attr-merge':{mergeAttrFirstTouch:(existing,incoming)=>{const out={...existing};for(const [k,v] of Object.entries(incoming||{})){if(v&&!String(out[k]||'').trim())out[k]=v;}return out;}},
  '../../../lib/whatsapp/browser-ids':{resolveBrowserIds:()=>({fbp:'',fbc:'',ga_client_id:''})},
  '../../../lib/catalog/sale-eligibility':{CatalogSaleError,requireCatalogSaleEligibility:async opts=>{calls.push({action:'stock_gate',opts});return {productHandle:opts.productHandle,productTitle:'Produto QA',reference:'REF-QA',sku:opts.sku,size:opts.size||null,price:123,quantity:2,checkedAt:'2026-09-22T00:00:00.000Z'};}},
 };
 vm.runInNewContext(compiled,{exports:exp,require:n=>{if(!(n in modules))throw Error('unexpected import');return modules[n];},process:{env:{}},console:{info:()=>{}},AbortSignal,fetch:async(url,opts)=>{calls.push({action:'webhook',payload:JSON.parse(opts.body)});if(upstream instanceof Error)throw upstream;return new Response(JSON.stringify(upstream),{status});},URL,Response});
 return {calls,run:(body={},cookie='')=>exp.POST(new NextRequest('https://valutin.invalid/api/atendimento/lead',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({nome:'QA Fixture',whatsapp:'+12025550101',consumidor_final:true,event_id:'qa-fixed-event',...body})}))};
}
test('server assigns slot before one intake request, normalizes attribution, pins effective owner slot',async()=>{const f=fixture({ok:true,lead_id:10,slot:'C',responsible_user_id:103});const r=await f.run({slot:'A',src:'primavera-verao-hero',utm_source:'google',client_id:'123.456',_fbp:'fixture-fbp'});assert.equal(r.status,200);assert.equal(f.calls.map(x=>x.action).join(','),'assign,webhook');assert.equal(f.calls[1].payload.slot,'B');assert.equal(f.calls[1].payload.event_id,'qa-fixed-event');assert.equal(f.calls[1].payload.src,'primavera-verao-hero');assert.equal(f.calls[1].payload.ga_client_id,'123.456');assert.equal(f.calls[1].payload.fbp,'fixture-fbp');assert.equal(r.cookies.get('vlt_wa_assignment').value,'C');assert.ok(r.cookies.get('vlt_retail_ok'));});
for(const [label,body,status] of [['HTTP failure',{ok:false},500],['empty response',{},200],['unconfirmed write',{ok:true},200],['network failure',new Error('fixture'),200]])test(`${label}: no success and no retail cookie`,async()=>{const f=fixture(body,status);const r=await f.run();assert.equal(r.status,503);assert.equal((await r.json()).ok,false);assert.equal(r.cookies.get('vlt_retail_ok'),undefined);assert.equal(r.cookies.get('vlt_wa_assignment').value,'B');});
test('existing owner conflict returns 409, no retail gate',async()=>{const f=fixture({ok:true,lead_id:10,route_conflict:true,slot:null});const r=await f.run();assert.equal(r.status,409);assert.equal(r.cookies.get('vlt_retail_ok'),undefined);});
test('missing event id and invalid phone cause no assignment or webhook',async()=>{for(const body of [{event_id:''},{whatsapp:'123'}]){const f=fixture();const r=await f.run(body);assert.equal(r.status,400);assert.equal(f.calls.length,0);}});
test('wholesale causes no assignment or webhook',async()=>{const f=fixture();const r=await f.run({message:'atacado'});assert.equal((await r.json()).blocked,true);assert.equal(f.calls.length,0);});

test('legacy retail declaration cannot bypass persisted intake; wholesale remains blocked', async()=>{
 const src=readFileSync(new URL('../app/api/atendimento/confirm/route.ts',import.meta.url),'utf8');
 const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exp={};
 const modules={'next/server':{NextRequest,NextResponse},'../../../lib/whatsapp/classifier':{isBlockedWholesale:s=>s.includes('atacado')?['atacado']:[]},'../../../lib/whatsapp/retail-gate':{GATE_PATH:'/atendimento',preserveSearch:s=>s}};
 vm.runInNewContext(js,{exports:exp,require:n=>modules[n],console:{info:()=>{}},process:{env:{}},URL});
 for(const decision of ['retail','yes']){
  const r=await exp.POST(new NextRequest('https://valutin.invalid/api/atendimento/confirm',{method:'POST',body:JSON.stringify({decision})}));
  assert.equal(r.status,409);assert.equal(r.cookies.get('vlt_retail_ok'),undefined);assert.equal((await r.json()).error,'intake_required');
 }
 const blocked=await exp.POST(new NextRequest('https://valutin.invalid/api/atendimento/confirm',{method:'POST',body:JSON.stringify({decision:'atacado'})}));
 assert.equal(blocked.status,200);assert.equal((await blocked.json()).blocked,true);
});

test('retail gate accepts current intake tokens and rejects previously signed legacy tokens',()=>{
 const src=readFileSync(new URL('../app/lib/whatsapp/retail-gate.ts',import.meta.url),'utf8');
 const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exp={};const secret='local-fixture-only';
 vm.runInNewContext(js,{exports:exp,require,process:{env:{VALUTIN_RETAIL_GATE_SECRET:secret}},Buffer,URLSearchParams});
 const token=exp.createRetailToken(1000,60);assert.equal(exp.verifyRetailToken(token,1001).ok,true);
 const legacy='v1.1060.1234567890abcdef';const signature=require('node:crypto').createHmac('sha256',secret).update(legacy).digest('hex');
 assert.equal(exp.verifyRetailToken(legacy+'.'+signature,1001).ok,false);
});

test('produto and browser ids reach webhook payload', async()=>{
  const f=fixture({ok:true,lead_id:10,slot:'B',responsible_user_id:102});
  const r=await f.run({produto:'vestido-laise',sku:'12345',tamanho:'4A',origem:'LP_CATALOGO',fbp:'fb.1.1.1',fbc:'fb.1.2.2',ga_client_id:'1.2',utm_source:'google',gclid:'G'});
  assert.equal(r.status,200);
  assert.equal(f.calls.map(x=>x.action).join(','),'stock_gate,assign,webhook');
  const payload=f.calls.find(x=>x.action==='webhook').payload;
  assert.equal(payload.produto,'vestido-laise');
  assert.equal(payload.origem,'LP_CATALOGO');
  assert.equal(payload.fbp,'fb.1.1.1');
  assert.equal(payload.fbc,'fb.1.2.2');
  assert.equal(payload.ga_client_id,'1.2');
  assert.equal(payload.gclid,'G');
  assert.equal(payload.catalog_sale_eligible,true);
  assert.equal(payload.catalog_sku,'12345');
  assert.equal(payload.linx_stock_quantity,2);
});

test('catalog lead without an SKU never reaches assignment or Kommo intake', async()=>{
  const f=fixture();
  const r=await f.run({produto:'vestido-laise',origem:'LP_CATALOGO'});
  assert.equal(r.status,409);
  assert.equal((await r.json()).error,'catalog_sku_required');
  assert.equal(f.calls.length,0);
});
