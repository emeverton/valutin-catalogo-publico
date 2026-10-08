import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {test} from 'node:test';
const require=createRequire(import.meta.url), ts=require('typescript');
function compile(file,modules={}) {const exp={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exp,require:n=>{assert.ok(n in modules,`Unexpected dependency: ${n}`);return modules[n]},URLSearchParams});return exp;}
test('public href builder does not load signing code and preserves product context',()=>{
 const {buildWhatsAppHref}=compile('../app/lib/whatsapp/href.ts',{'./config':{DEFAULT_WA_TEXT:'hello'}});
 const url=new URL(buildWhatsAppHref({src:'catalogo',text:'Consultar vestido',extra:{produto:'vestido-de-laise'}}),'https://example.test');
 assert.equal(url.pathname,'/atendimento');assert.equal(url.searchParams.get('produto'),'vestido-de-laise');assert.equal(url.searchParams.get('text'),'Consultar vestido');
});
test('middleware handles malformed encoding and encoded wholesale without crashing',async()=>{
 const {NextRequest,NextResponse}=require('next/server');
 const {middleware}=compile('../middleware.ts',{'next/server':{NextRequest,NextResponse},'./app/lib/dashboard/auth':{DASH_COOKIE:'session',verifySession:async()=>false},'./app/lib/editor/auth':{EDITOR_COOKIE:'editor',verifyEditorSession:async()=>false},'./app/lib/whatsapp/config':{ATTR_KEYS:[],COOKIE_ATTR:'attr',COOKIE_MAX_AGE:60},'./app/lib/whatsapp/attr-merge':{mergeAttrFirstTouch:(a,b)=>({...a,...b})}});
 for(const query of ['?text=%E0%A4%A','?text=grade+fechada','?text=%61tacado']) {
  const response=await middleware(new NextRequest(`https://example.test/wa${query}`));
  assert.equal(response.status,302);assert.ok(response.headers.get('location').includes('/atendimento'));
  if(!query.includes('%E0'))assert.ok(response.headers.get('location').includes('blocked=wholesale'));
 }
});
