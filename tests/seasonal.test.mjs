import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {test} from 'node:test';
const require=createRequire(import.meta.url),ts=require('typescript'),exp={};
const source=readFileSync(new URL('../app/lib/seasonal.ts',import.meta.url),'utf8');
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exp,Intl,Date});
test('calendar switches in Sao Paulo through December and returns evergreen in 2027',()=>{
 for(const [date,label] of [['2026-09-20T02:59:59Z','PRIMAVERA VALUTIN'],['2026-09-20T03:00:00Z','DIA DAS CRIANÇAS'],['2026-10-12T12:00:00Z','DIA DAS CRIANÇAS'],['2026-10-13T03:00:00Z','PRIMAVERA · OCASIÕES ESPECIAIS'],['2026-11-01T03:00:00Z','CURADORIA DE FIM DE ANO'],['2026-12-01T03:00:00Z','NATAL VALUTIN'],['2026-12-26T03:00:00Z','BOAS FESTAS'],['2027-01-01T03:00:00Z','CURADORIA VALUTIN']])assert.equal(exp.seasonalCampaign(new Date(date)).label,label,date);
});
test('all catalog photos exist and every product has price data or an explicit consultation state',()=>{
 const products=JSON.parse(readFileSync(new URL('../app/lib/catalog.json',import.meta.url),'utf8'));
 assert.equal(products.length,63);assert.equal(new Set(products.map(p=>p.handle)).size,63);
 for(const p of products){
  assert.ok(p.price === null || p.price>0);assert.ok(p.sizes.length);
  assert.equal(p.images.length,p.imageLabels.length,`${p.handle}: labels`);
  assert.equal(p.images.length,p.displayImages.length,`${p.handle}: display images`);
  for(const photo of [...p.images,...p.displayImages])assert.ok(existsSync(new URL(`../public${photo}`,import.meta.url)),photo);
 }
});
