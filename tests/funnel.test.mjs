import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const source=readFileSync(new URL('../app/lib/funnel.ts',import.meta.url),'utf8');
function fixture(host,consent=true){const window={location:{hostname:host},dataLayer:[]},exports={},timers=[];const require=(path)=>{if(path==='./cookie-consent')return {hasOptionalCookieConsent:()=>consent};throw new Error(`Unexpected module: ${path}`);};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{window,exports,require,setTimeout:fn=>timers.push(fn)});return {window,exports,timers};}
test('preview and deceptive suffix hosts send neither diagnostic nor lead events',async()=>{for(const host of ['localhost','valutin-preview.vercel.app','www.valutin.com.br.evil.test']){const f=fixture(host);f.exports.trackFunnel('vlt_form_start');await f.exports.trackConfirmedLead('fixture_id');assert.equal(f.window.dataLayer.length,0);}});
test('diagnostic payload is allowlisted and contains no contact/query values',()=>{const f=fixture('www.valutin.com.br');f.exports.trackFunnel('vlt_form_start');f.exports.trackFunnel('purchase');assert.equal(f.window.dataLayer.length,1);assert.deepEqual(Object.keys(f.window.dataLayer[0]),['event']);});
test('confirmed lead uses one CRM event ID and redirects after callback',async()=>{const f=fixture('www.valutin.com.br');const pending=f.exports.trackConfirmedLead('fixture_id');assert.equal(f.window.dataLayer.filter(x=>x.event==='generate_lead').length,1);assert.equal(f.window.dataLayer[0].event_id,'fixture_id');f.window.dataLayer[1].eventCallback();await pending;});
test('blocked GTM cannot trap the visitor: timeout releases navigation',async()=>{const f=fixture('valutin.com.br');const pending=f.exports.trackConfirmedLead('fixture_id');f.timers[0]();await pending;});
test('optional consent gates product and lead events',async()=>{const f=fixture('www.valutin.com.br',false);f.exports.trackProductDetailView('vestido-de-laise-rosa');f.exports.trackCatalogItemView({id:'vlt_123',title:'Vestido',price:100});await f.exports.trackConfirmedLead('fixture_id');assert.equal(f.window.dataLayer.length,0);});
test('PDP interest is distinct from SKU-matched ecommerce view_item',()=>{const f=fixture('www.valutin.com.br');f.exports.trackProductDetailView('vestido-de-laise-rosa');assert.equal(f.window.dataLayer.length,1);assert.deepEqual(Object.keys(f.window.dataLayer[0]),['event','product_handle']);assert.equal(f.window.dataLayer[0].product_handle,'vestido-de-laise-rosa');});
