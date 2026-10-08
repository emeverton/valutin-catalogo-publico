import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const exports = {};
const source = readFileSync(new URL('../app/lib/editor/content.ts', import.meta.url), 'utf8');
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, Error, Object });

test('approved content is valid and keeps all existing media paths', () => {
  assert.deepEqual(Object.keys(exports.validateContent(exports.DEFAULT_CONTENT)).sort(), Object.keys(exports.DEFAULT_CONTENT).sort());
});

test('editor rejects unknown fields, external media and missing alt text', () => {
  assert.throws(() => exports.validateContent({ ...exports.DEFAULT_CONTENT, extra: 'x' }));
  assert.throws(() => exports.validateContent({ ...exports.DEFAULT_CONTENT, heroPoster: 'https://other.example/a.jpg' }));
  assert.throws(() => exports.validateContent({ ...exports.DEFAULT_CONTENT, facadeAlt: '' }));
});

test('editor accepts its uploaded files and allows a poster-only hero', () => {
  const content = { ...exports.DEFAULT_CONTENT, heroPoster: '/api/editor/media?path=primavera-verao/123e4567-e89b-12d3-a456-426614174000.jpg', heroVideo: '' };
  assert.equal(exports.validateContent(content).heroVideo, '');
});

test('old published content inherits safe CTA destinations and palette', () => {
  const old = { ...exports.DEFAULT_CONTENT };
  delete old.heroCtaHref; delete old.outingsCtaHref; delete old.blueCtaHref; delete old.themeAccent;
  const current = exports.validateContent(old);
  assert.equal(current.heroCtaHref, '#destaques');
  assert.equal(current.themeAccent, '#526c87');
  assert.throws(() => exports.validateContent({ ...current, heroCtaHref: 'https://evil.example/' }));
  assert.throws(() => exports.validateContent({ ...current, themeAccent: '#ffffff' }));
});
