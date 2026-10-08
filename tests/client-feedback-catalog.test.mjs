import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('45 fotos recebidas agrupadas em 26 fichas sem publicar arquivos privados', () => {
  const products = JSON.parse(read('app/lib/catalog.json')).filter(p => p.images.some(src => src.startsWith('/catalog-outubro/')));
  assert.equal(products.length, 26);
  const photos = products.flatMap(p => p.images);
  assert.equal(photos.length, 45);
  assert.equal(new Set(photos).size, 45);
  const files = readdirSync(new URL('../public/catalog-outubro/', import.meta.url));
  assert.equal(files.length, 45);
  assert.ok(files.every(file => photos.includes(`/catalog-outubro/${file}`)));
  for (const product of products.filter(p => p.reference === null)) {
    assert.equal(product.price, null);
    assert.deepEqual(product.sizes, ['Sob consulta']);
    assert.equal(product.linxSku, undefined);
  }
});

test('novidades preservam preços e referências documentadas sem inventar tamanhos ou SKUs', () => {
  const catalog = JSON.parse(read('app/lib/catalog.json'));
  for (const [handle, reference, price, category] of [
    ['vestido-rosa-com-lacos', 'PV26/27RO006CT', 428, 'vestidos'],
    ['coelha-vestido-floral', 'VLT BEM020AC', 169, 'presentes-e-lembrancas'],
    ['vestido-floral-azul-com-gola', 'PV26/27RO008CT', 469, 'vestidos'],
    ['cardigan-bordado-analu', 'VLT ANALU027CT', 369, 'tricos-e-casacos'],
  ]) {
    const product = catalog.find(p => p.handle === handle);
    assert.equal(product.reference, reference);
    assert.equal(product.price, price);
    assert.equal(product.catalogCategory, category);
    assert.deepEqual(product.sizes, ['Sob consulta']);
    assert.equal(product.linxSku, undefined);
  }
});

test('camisetas incluem 18 meses informado pela cliente sem remover tamanhos', () => {
  const product = JSON.parse(read('app/lib/catalog.json')).find(p => p.handle === 'camiseta-algodao');
  assert.deepEqual(product.sizes, ['12M', '18M', '2A', '4A', '6A', '8A', '10A', '12A']);
  assert.equal(product.price, 179);
});

test('PDP não usa a nomenclatura Maison rejeitada pela cliente', () => {
  assert.doesNotMatch(read('app/components/ProductDetail.tsx'), /maison/i);
});

test('foto tratada do floral mantém índice da variante e valor comercial', () => {
  const product = JSON.parse(read('app/lib/catalog.json')).find(p => p.handle === 'vestido-listrado-algodao');
  assert.equal(product.images[2], '/catalog-retouched/vestido-floral-campo-v2.png');
  assert.equal(product.displayImages[2], product.images[2]);
  assert.equal(product.price, 438);
});

test('rodapé não promete estoque em tempo real sem comprovação', () => {
  const footer = read('app/components/Footer.tsx');
  assert.doesNotMatch(footer, /estoque em tempo real/i);
  assert.match(footer, /Nossa equipe confirma o tamanho e a disponibilidade/);
});
