import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const exports = {};
const source = readFileSync(new URL('../app/lib/editor/catalog-products.ts', import.meta.url), 'utf8');
const products = [
  { handle: 'vestido-rosa', title: 'Vestido rosa', description: 'Algodão', price: 199, reference: 'VLT-1', sizes: ['2A'], displayImages: ['/a.jpg'] },
  { handle: 'vestido-azul', title: 'Vestido azul', description: 'Linho', price: 299, reference: 'VLT-2', sizes: ['4A'], displayImages: ['/b.jpg'] },
];
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports, require: (name) => name === '../catalog-individual' ? { catalogProducts: products } : undefined,
  Object, Map, Array, Error, Number, Math,
});

test('edits title, description and price only for the exact product', () => {
  const edits = exports.validateProductEdits({ 'vestido-rosa': { title: 'Novo vestido rosa', description: 'Algodão leve', price: 219.9 } });
  const result = exports.applyProductEdits(products, edits);
  assert.equal(result[0].title, 'Novo vestido rosa');
  assert.equal(result[0].price, 219.9);
  assert.equal(result[0].reference, 'VLT-1');
  assert.deepEqual(result[0].sizes, ['2A']);
  assert.equal(result[1], products[1]);
});

test('rejects unknown products, SKU edits and invalid prices', () => {
  assert.throws(() => exports.validateProductEdits({ evil: { title: 'X', description: 'Y', price: 10 } }));
  assert.throws(() => exports.validateProductEdits({ 'vestido-rosa': { title: 'X', description: 'Y', price: 10, linxSku: '1' } }));
  assert.throws(() => exports.validateProductEdits({ 'vestido-rosa': { title: 'X', description: 'Y', price: -1 } }));
  assert.throws(() => exports.validateProductEdits({ 'vestido-rosa': { title: 'X', description: 'Y', price: 1.234 } }));
});

test('accepts manual quantities by size and distinguishes zero from unreported', () => {
  const edits = exports.validateProductEdits({ 'vestido-rosa': { title: 'Vestido rosa', description: 'Algodão', price: 199, stock: { '2A': 0 } } });
  const result = exports.applyProductEdits(products, edits);
  assert.equal(result[0].stock['2A'], 0);
  assert.equal(result[1].stock, undefined);
  assert.throws(() => exports.validateProductEdits({ 'vestido-rosa': { title: 'X', description: 'Y', price: 10, stock: { '4A': 2 } } }));
  assert.throws(() => exports.validateProductEdits({ 'vestido-rosa': { title: 'X', description: 'Y', price: 10, stock: { '2A': -1 } } }));
  assert.throws(() => exports.validateProductEdits({ 'vestido-rosa': { title: 'X', description: 'Y', price: 10, stock: { '2A': 1.5 } } }));
});
