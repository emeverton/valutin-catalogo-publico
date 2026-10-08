import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../app/lib/editor/new-products.ts', import.meta.url), 'utf8');
const exports = {};
const image = '/api/editor/media?path=catalogo/123e4567-e89b-12d3-a456-426614174000.jpg';
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports,
  require: (name) => name === '../catalog-individual' ? { catalogProducts: [{ handle: 'peca-existente' }] } : name === '../catalog-navigation' ? {
    departments: [{ slug: 'crianca' }], productCategories: [{ slug: 'vestidos' }],
  } : name === '../catalog.json' ? { __esModule: true, default: [{ handle: 'familia-antiga' }] } : undefined,
  Object, Map, Set, Array, Error, Number, Math,
});

function piece(patch = {}) {
  return {
    handle: 'vestido-azul-novo', title: 'Vestido Azul Novo', description: 'Vestido de algodão.',
    category: 'crianca', catalogCategory: 'vestidos', collection: 'primavera-verao', price: 219.9,
    reference: null, sizes: ['4A', '6A'], stock: { '4A': 2, '6A': 0 }, images: [image], imageLabels: ['Frente do vestido'], active: true,
    ...patch,
  };
}

test('publishes a complete new piece without changing its category, price, photos or zero stock', () => {
  const [item] = exports.validateNewProducts([piece()]);
  const catalogItem = exports.asCatalogItem(item);
  assert.equal(catalogItem.catalogCategory, 'vestidos');
  assert.equal(catalogItem.collection, 'primavera-verao');
  assert.equal(catalogItem.price, 219.9);
  assert.equal(catalogItem.stock['6A'], 0);
  assert.equal(catalogItem.displayImages[0], image);
});

test('rejects duplicate and reserved handles, external photos, fake stock and unexpected fields', () => {
  assert.throws(() => exports.validateNewProducts([piece({ handle: 'peca-existente' })]));
  assert.throws(() => exports.validateNewProducts([piece({ handle: 'familia-antiga' })]));
  assert.throws(() => exports.validateNewProducts([piece({ handle: 'primavera-verao' })]));
  assert.throws(() => exports.validateNewProducts([piece(), piece()]));
  assert.throws(() => exports.validateNewProducts([piece({ images: ['https://example.com/a.jpg'] })]));
  assert.throws(() => exports.validateNewProducts([piece({ stock: { '8A': 2 } })]));
  assert.throws(() => exports.validateNewProducts([piece({ linxSku: '123' })]));
});
