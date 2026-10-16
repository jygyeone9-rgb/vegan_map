import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { dietLabels, safeUrl, isVerified } from '../src/lib/catalog.js';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'));
const restaurants = read('restaurants'), menus = read('menus'), interviews = read('interviews');
const ids = list => {
  assert.ok(Array.isArray(list), 'Data must be an array');
  assert.equal(new Set(list.map(item => item.id)).size, list.length, 'Duplicate ID');
  for (const item of list) assert.match(item.id, /^[a-zA-Z0-9-]+$/, 'IDs must be safe hash route segments');
};
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
const checkVerification = v => {
  assert.ok(v && ['pending','verified','recheck'].includes(v.status), 'Invalid verification status');
  assert.ok(typeof v.method === 'string' && v.method.trim(), 'Verification method required');
  assert.ok(v.checkedAt === null || date(v.checkedAt), 'Invalid confirmation date');
  assert.ok(!v.sourceUrl || safeUrl(v.sourceUrl), 'Evidence must use HTTPS');
  if (v.status === 'verified') assert.ok(date(v.checkedAt) && safeUrl(v.sourceUrl), 'Verified records require date and source URL');
};
for (const list of [restaurants,menus,interviews]) ids(list);
for (const r of restaurants) {
  for (const key of ['name','district','neighborhood','address','category','hours','closedDays','description']) assert.ok(typeof r[key] === 'string' && r[key].trim(), `${r.id}: missing ${key}`);
  assert.ok(typeof r.isSample === 'boolean' && typeof r.nearHanyang === 'boolean');
  assert.ok(Array.isArray(r.stations) && r.stations.every(s => typeof s === 'string'));
  assert.ok(Number.isFinite(r.lat) && r.lat >= 37.4 && r.lat <= 37.75, 'Latitude outside Seoul area');
  assert.ok(Number.isFinite(r.lng) && r.lng >= 126.7 && r.lng <= 127.3, 'Longitude outside Seoul area');
  assert.ok(['vegan','options','pending'].includes(r.venueType));
  checkVerification(r.verification);
  if (r.venueType !== 'pending') assert.equal(r.verification.status, 'verified', 'Venue type requires evidence');
  for (const url of Object.values(r.links)) assert.ok(!url || safeUrl(url), 'External links require HTTPS');
}
for (const m of menus) {
  assert.ok(restaurants.some(r => r.id === m.restaurantId), `${m.id}: unknown restaurant`);
  assert.ok(typeof m.name === 'string' && m.name.trim());
  assert.ok(m.price === null || (Number.isInteger(m.price) && m.price >= 0), 'Price must be KRW integer or null');
  assert.ok(Array.isArray(m.ingredients) && m.ingredients.every(i => typeof i === 'string'));
  assert.ok(Array.isArray(m.dietTypes) && m.dietTypes.every(type => type in dietLabels));
  assert.ok(['unknown','possible','none'].includes(m.crossContact));
  assert.equal(typeof m.available, 'boolean');
  checkVerification(m.verification);
  if (m.dietTypes.length) assert.ok(isVerified(m), 'Diet labels require verified ingredients');
  if (m.crossContact === 'none') assert.ok(isVerified(m), 'No-cross-contact statement needs evidence');
  if (m.photoUrl) assert.ok(safeUrl(m.photoUrl) && m.photoConsent && m.photoAlt, 'Photos need URL, consent and alt text');
}
for (const i of interviews) {
  assert.ok(restaurants.some(r => r.id === i.restaurantId));
  assert.ok(['draft','published'].includes(i.status));
  if (i.status === 'published') {
    assert.ok(i.consent === true && date(i.date), 'Publication needs consent and date');
    for (const field of ['title','summary','interviewer']) assert.ok(typeof i[field] === 'string' && i[field].trim());
    assert.ok(Array.isArray(i.questions) && i.questions.length && i.questions.every(q => q.question && q.answer));
    if (i.photoUrl) assert.ok(i.photoConsent && i.photoAlt && safeUrl(i.photoUrl));
  }
}
console.log(`Data valid: ${restaurants.length} restaurants, ${menus.length} menus, ${interviews.length} interviews`);
