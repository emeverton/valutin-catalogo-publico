import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../app/lib/whatsapp/browser-ids.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports, module: { exports }, require });
const { parseGaClientId, buildFbcFromFbclid, resolveBrowserIds } = exports;

test('parseGaClientId strips GA1.1 prefix', () => {
  assert.equal(parseGaClientId('GA1.1.123456789.987654321'), '123456789.987654321');
  assert.equal(parseGaClientId('123.456'), '123.456');
  assert.equal(parseGaClientId(''), '');
});

test('buildFbcFromFbclid', () => {
  assert.equal(buildFbcFromFbclid('abc', 1700000000), 'fb.1.1700000000.abc');
  assert.equal(buildFbcFromFbclid(''), '');
});

test('resolveBrowserIds prefers existing _fbc over synthesis', () => {
  const ids = resolveBrowserIds({
    cookieHeader: '_fbp=fb.1.1.1; _fbc=fb.1.2.EXISTING; _ga=GA1.1.9.8',
    fbclid: 'CLICK',
    nowSec: 99,
  });
  assert.equal(ids.fbp, 'fb.1.1.1');
  assert.equal(ids.fbc, 'fb.1.2.EXISTING');
  assert.equal(ids.ga_client_id, '9.8');
});

test('resolveBrowserIds synthesizes fbc from fbclid when _fbc missing', () => {
  const ids = resolveBrowserIds({ cookieHeader: '_fbp=x', fbclid: 'CLICK', nowSec: 42 });
  assert.equal(ids.fbc, 'fb.1.42.CLICK');
});
