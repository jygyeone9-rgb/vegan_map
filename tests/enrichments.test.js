import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enrichMenus } from '../src/lib/enrichMenus.js';
import { defaults, menuMatches, isVerified, getPhotoUrl } from '../src/lib/catalog.js';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'));
test('price enrichment preserves ingredient evidence and filters by the published offer', () => {
  const original = read('menus'), updates = read('menu-enrichments');
  const enriched = enrichMenus(original, updates);
  assert.equal(enriched.length, original.length);
  assert.equal(enriched.filter(m => Number.isFinite(m.price)).length, 3);
  for (const update of updates) {
    const m = enriched.find(m => m.id === update.id), base = original.find(m => m.id === update.id);
    assert.equal(m.price, update.price);
    assert.deepEqual(m.verification, base.verification);
    assert.equal(m.available, base.available);
    assert.equal(isVerified(m), false);
    assert.equal(getPhotoUrl(m), '');
    assert.equal(menuMatches(m, {...defaults, price:'5000'}), true);
    assert.equal(menuMatches(m, {...defaults, price:'2000'}), false);
    assert.equal(m.priceVerification.channel, 'online');
  }
});
test('enrichment cannot overwrite dietary evidence or photo permission', () => {
  const base = read('menus')[0];
  const [result] = enrichMenus([base], [{id:base.id, verification:{status:'verified'},photoConsent:true}]);
  assert.deepEqual(result.verification, base.verification);
  assert.equal(result.photoConsent, base.photoConsent);
});
