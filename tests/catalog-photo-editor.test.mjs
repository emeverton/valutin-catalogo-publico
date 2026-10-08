import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../app/lib/editor/catalog-media.ts', import.meta.url), 'utf8');
const exports = {};
const products = [
  { handle: 'vestido-rosa', title: 'Vestido rosa', displayImages: ['/catalog/rosa.jpg', '/catalog/rosa-detalhe.jpg'], imageLabels: ['Frente', 'Detalhe'], price: 199 },
  { handle: 'vestido-azul', title: 'Vestido azul', displayImages: ['/catalog/azul.jpg'], imageLabels: ['Frente'], price: 199 },
];
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports, require: (name) => name === '../catalog-individual' ? { catalogProducts: products } : undefined,
  Object, Map, Set, Array, Error,
});

const uploaded = '/api/editor/media?path=catalogo/123e4567-e89b-12d3-a456-426614174000.jpg';

test('photos are scoped to an individual product and do not alter commercial fields', () => {
  const media = exports.validateCatalogMedia({ 'vestido-rosa': { images: [uploaded, '/catalog/rosa.jpg'], labels: ['Nova capa', 'Frente'] } });
  const result = exports.applyCatalogMedia(products, media);
  assert.deepEqual(result[0].displayImages, [uploaded, '/catalog/rosa.jpg']);
  assert.deepEqual(result[0].imageLabels, ['Nova capa', 'Frente']);
  assert.equal(result[0].price, 199);
  assert.equal(result[1], products[1]);
});

test('rejects cross-variant originals, external URLs and incomplete galleries', () => {
  assert.throws(() => exports.validateCatalogMedia({ 'vestido-rosa': { images: ['/catalog/azul.jpg'], labels: ['Errada'] } }));
  assert.throws(() => exports.validateCatalogMedia({ 'vestido-rosa': { images: ['https://example.org/a.jpg'], labels: ['Externa'] } }));
  assert.throws(() => exports.validateCatalogMedia({ 'vestido-rosa': { images: [uploaded], labels: [] } }));
  assert.throws(() => exports.validateCatalogMedia({ 'vestido-rosa': { images: [uploaded], labels: [''] } }));
});
