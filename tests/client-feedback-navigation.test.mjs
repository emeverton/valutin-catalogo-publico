import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('store navigation replaces Maison and links to the existing store section', () => {
  const header = source('app/components/Header.tsx');
  assert.doesNotMatch(header, /A Maison/);
  assert.match(header, /const storeHref = "\/catalogo\/primavera-verao#visite-a-loja"/);
  assert.equal((header.match(/href=\{storeHref\}/g) || []).length, 2);
  assert.match(source('app/components/SpringSummerStoreVisit.tsx'), /id="visite-a-loja"/);
});

test('desktop and mobile share department navigation without deleting the seasonal page', () => {
  const header = source('app/components/Header.tsx');
  assert.match(header, /megaMenuSections\.filter\(\(section\) => section\.key !== "primavera-verao"\)/);
  assert.equal((header.match(/departmentSections\.map/g) || []).length, 2);
  assert.match(source('app/page.tsx'), /redirect\("\/catalogo\/primavera-verao"\)/);
  const page = source('app/catalogo/primavera-verao/page.tsx');
  const components = [...page.matchAll(/<(SpringSummer\w+)\b/g)].map(match => match[1]).filter(name => name !== 'SpringSummerView');
  assert.deepEqual(components, ['SpringSummerHero', 'SpringSummerSecondFold', 'SpringSummerProductShelf', 'SpringSummerCategoryStories', 'SpringSummerConcierge', 'SpringSummerEditorial', 'SpringSummerStoreVisit']);
});

test('public institutional labels no longer use Maison', () => {
  assert.doesNotMatch(source('app/sobre-a-valutin/page.tsx'), /Maison/);
  assert.doesNotMatch(source('app/components/Footer.tsx'), /Maison/);
});
