import assert from 'node:assert/strict';
import { test } from 'node:test';

const PLACEHOLDER_VALUE = 426;
function resolveLeadValue(customRaw, priceRaw) {
  const customLeadValue = Number(customRaw);
  const kommoPrice = Number(priceRaw);
  let leadValue = null;
  if (Number.isFinite(customLeadValue) && customLeadValue > 0 && customLeadValue !== PLACEHOLDER_VALUE) {
    leadValue = customLeadValue;
  } else if (Number.isFinite(kommoPrice) && kommoPrice > 0 && kommoPrice !== PLACEHOLDER_VALUE) {
    leadValue = kommoPrice;
  }
  return leadValue;
}

const cases = [
  [426, 426, null],
  [426, 599, 599],
  [599, 426, 599],
  [599, 699, 599],
  [0, 0, null],
  ['', '', null],
  [NaN, 800, 800],
];

for (const [c, p, expected] of cases) {
  test(`leadValue(${c}, ${p}) => ${expected}`, () => {
    assert.equal(resolveLeadValue(c, p), expected);
  });
}
