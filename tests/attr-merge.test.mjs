import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../app/lib/whatsapp/attr-merge.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
const modules = {
  './config': {
    ATTR_KEYS: ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_referrer','gclid','gbraid','wbraid','fbclid','fbp','fbc','ga_client_id'],
  },
};
vm.runInNewContext(compiled, { exports, module: { exports }, require: (n) => modules[n], URLSearchParams });
const { mergeAttrFirstTouch, appendAttrFromSearch, buildAtendimentoHref } = exports;

test('first-touch does not overwrite filled keys', () => {
  const out = mergeAttrFirstTouch(
    { utm_source: 'google', gclid: 'AAA' },
    { utm_source: 'instagram', fbclid: 'BBB' }
  );
  assert.equal(out.utm_source, 'google');
  assert.equal(out.gclid, 'AAA');
  assert.equal(out.fbclid, 'BBB');
});

test('appendAttrFromSearch preserves without duplicates', () => {
  const dest = new URLSearchParams({ src: 'catalogo', produto: 'x' });
  appendAttrFromSearch(dest, 'utm_source=google&gclid=G1&produto=ignored');
  assert.equal(dest.get('utm_source'), 'google');
  assert.equal(dest.get('gclid'), 'G1');
  assert.equal(dest.get('produto'), 'x');
});

test('buildAtendimentoHref merges extras and search', () => {
  const href = buildAtendimentoHref({ search: '?utm_source=meta&fbclid=F1', extra: { src: 'header' } });
  assert.match(href, /^\/atendimento\?/);
  assert.match(href, /src=header/);
  assert.match(href, /utm_source=meta/);
  assert.match(href, /fbclid=F1/);
});
