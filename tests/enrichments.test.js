import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enrichMenus } from '../src/lib/enrichMenus.js';
import { defaults, menuMatches, isVerified, getPhotoUrl, searchCatalog } from '../src/lib/catalog.js';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'));
test('price enrichment preserves ingredient evidence and filters by the published offer', () => {
  const original = read('menus'), updates = read('menu-enrichments');
  const enriched = enrichMenus(original, updates);
  assert.equal(enriched.length, original.length);
  assert.equal(enriched.filter(m => Number.isFinite(m.price)).length, updates.length);
  for (const update of updates) {
    const m = enriched.find(m => m.id === update.id), base = original.find(m => m.id === update.id);
    assert.equal(m.price, update.price);
    assert.deepEqual(m.verification, base.verification);
    assert.equal(m.available, base.available);
    assert.equal(isVerified(m), false);
    assert.equal(getPhotoUrl(m), '');
    assert.equal(menuMatches(m, {...defaults, price:String(m.price)}), m.priceVerification.qualifier !== 'from');
    assert.equal(menuMatches(m, {...defaults, price:String(Math.max(0, m.price - 1))}), false);
    assert.equal(m.priceVerification.restaurantId, base.restaurantId);
    assert.equal(menuMatches(m, {...defaults, pricedOnly:true}), true);
  }
});
test('enrichment cannot overwrite dietary evidence or photo permission', () => {
  const base = read('menus')[0];
  const [result] = enrichMenus([base], [{id:base.id, verification:{status:'verified'},photoConsent:true}]);
  assert.deepEqual(result.verification, base.verification);
  assert.equal(result.photoConsent, base.photoConsent);
});

test('price-only discovery returns priced restaurants and menus, excluding closed locations', () => {
  const original = read('menus'), updates = read('menu-enrichments');
  const enriched = enrichMenus(original, updates);
  const rows = searchCatalog(read('restaurants'), enriched, [], {...defaults, pricedOnly:true});
  assert.equal(rows.length, 251);
  assert.equal(rows.flatMap(r => r.menus).length, 330);
  assert.ok(rows.every(r => r.menus.every(m => m.priceVerification.restaurantId === r.restaurant.id)));
  assert.equal(searchCatalog(read('restaurants'), enriched, [], {...defaults, query:'목로정원', pricedOnly:true}).length, 1);
  const activeIds = new Set(read('closed-restaurants').map(r => r.restaurantId));
  assert.equal(read('restaurants').filter(r => !activeIds.has(r.id) && !rows.some(row => row.restaurant.id === r.id)).length, 30);
  const lowerBound = enriched.find(m => m.priceVerification?.qualifier === 'from');
  assert.equal(menuMatches(lowerBound, {...defaults,price:'20000'}), false);
  assert.equal(menuMatches(lowerBound, {...defaults,pricedOnly:true}), true);
  assert.equal(menuMatches(original[0], {...defaults,pricedOnly:true}), false);
  assert.ok(!updates.some(u => u.id.startsWith('seoul-275-') || u.id.startsWith('seoul-293-')));
});

