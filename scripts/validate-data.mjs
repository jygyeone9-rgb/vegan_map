import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { dietLabels, safeUrl, isVerified, isDocumented, getPhotoUrl } from '../src/lib/catalog.js';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), 'utf8'));
const restaurants = read('restaurants'), menus = read('menus'), interviews = read('interviews');
const source = read('handbook-source');
const ids = list => {
  assert.ok(Array.isArray(list), 'Data must be an array');
  assert.equal(new Set(list.map(item => item.id)).size, list.length, 'Duplicate ID');
  for (const item of list) assert.match(item.id, /^[a-zA-Z0-9-]+$/, 'IDs must be safe hash route segments');
};
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
const checkVerification = v => {
  assert.ok(v && ['pending','documented','verified','recheck'].includes(v.status), 'Invalid verification status');
  assert.ok(typeof v.method === 'string' && v.method.trim(), 'Verification method required');
  assert.ok(v.checkedAt === null || date(v.checkedAt), 'Invalid confirmation date');
  assert.ok(!v.sourceUrl || safeUrl(v.sourceUrl), 'Evidence must use HTTPS');
  if (v.status === 'verified') assert.ok(date(v.checkedAt) && safeUrl(v.sourceUrl), 'Verified records require date and source URL');
  if (v.status === 'documented') {
    assert.equal(v.sourceId, source.id, 'Unknown document source');
    assert.equal(v.sourceUrl, source.url, 'Unexpected document source URL');
    assert.equal(v.checkedAt, null, 'Document import is not an individual ingredient recheck');
    assert.ok(Number.isInteger(v.pdfPage) && v.pdfPage >= 12 && v.pdfPage <= 61);
    assert.ok(Number.isInteger(v.printedPage) && v.printedPage >= 20 && v.printedPage <= 118);
    assert.ok(Number.isInteger(v.recordNumber) && v.recordNumber >= 1 && v.recordNumber <= 300);
  }
};
for (const list of [restaurants,menus,interviews]) ids(list);
for (const r of restaurants) {
  for (const key of ['name','district','neighborhood','address','category','hours','closedDays','description']) assert.ok(typeof r[key] === 'string' && r[key].trim(), `${r.id}: missing ${key}`);
  assert.ok(typeof r.isSample === 'boolean' && typeof r.nearHanyang === 'boolean');
  assert.ok(Array.isArray(r.stations) && r.stations.every(s => typeof s === 'string'));
  assert.ok(Number.isFinite(r.lat) && r.lat >= 37.4 && r.lat <= 37.75, 'Latitude outside Seoul area');
  assert.ok(Number.isFinite(r.lng) && r.lng >= 126.7 && r.lng <= 127.3, 'Longitude outside Seoul area');
  assert.ok(['vegan','specialist','options','pending'].includes(r.venueType));
  checkVerification(r.verification);
  if (r.venueType !== 'pending') assert.ok(['verified','documented'].includes(r.verification.status), 'Venue type requires evidence');
  if (r.venueType === 'vegan') assert.equal(r.verification.status, 'verified', 'PDF vegetarian specialist label does not prove a fully vegan restaurant');
  assert.ok(r.location && safeUrl(r.location.url), 'Coordinate source required');
  assert.ok(['matched','address-differs'].includes(r.location.status));
  if (r.location.status === 'address-differs') assert.ok(r.location.note && r.location.address !== r.address, 'Address mismatch must be explicit');
  for (const url of Object.values(r.links)) assert.ok(!url || safeUrl(url), 'External links require HTTPS');
}
for (const m of menus) {
  assert.ok(restaurants.some(r => r.id === m.restaurantId), `${m.id}: unknown restaurant`);
  assert.ok(typeof m.name === 'string' && m.name.trim());
  assert.ok(m.price === null || (Number.isInteger(m.price) && m.price >= 0), 'Price must be KRW integer or null');
  assert.ok(Array.isArray(m.ingredients) && m.ingredients.every(i => typeof i === 'string'));
  assert.ok(Array.isArray(m.dietTypes) && m.dietTypes.every(type => type in dietLabels));
  assert.ok(['unknown','possible','none'].includes(m.crossContact));
  assert.ok(typeof m.available === 'boolean' || (m.available === null && m.verification.status === 'documented'), 'Historical documents do not prove current availability');
  checkVerification(m.verification);
  if (m.dietTypes.length) assert.ok(isVerified(m), 'Diet labels require verified ingredients');
  if (m.verification.status === 'documented') {
    assert.ok(isDocumented(m), 'PDF tag and documented diet type must agree');
    const r = restaurants.find(r => r.id === m.restaurantId);
    for (const field of ['sourceId','recordNumber','pdfPage','printedPage']) assert.equal(m.verification[field], r.verification[field], 'Menu source does not match its restaurant card');
  }
  if (m.crossContact === 'none') assert.ok(isVerified(m), 'No-cross-contact statement needs evidence');
  if (m.photoUrl) assert.ok(getPhotoUrl(m), 'Photos need HTTPS URL, source, consent and alt text');
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
assert.equal(restaurants.length, source.restaurantCount, 'Restaurant count differs from source manifest');
assert.equal(menus.length, source.menuCount, 'Menu count differs from source manifest');
assert.equal(new Set(restaurants.map(r => r.verification.recordNumber)).size, source.restaurantCount, 'Each PDF record must occur once');
assert.ok(restaurants.every(r => menus.some(m => m.restaurantId === r.id)), 'Each restaurant needs at least one menu');
assert.equal(source.surveyMonth, '2025-10');
assert.match(source.sha256, /^[a-f0-9]{64}$/);
console.log(`Data valid: ${restaurants.length} restaurants, ${menus.length} menus, ${interviews.length} interviews`);

const updates = read('menu-enrichments');
ids(updates);
for (const update of updates) {
  assert.ok(menus.some(m => m.id === update.id), 'Enrichment must reference an existing menu');
  assert.ok(Number.isInteger(update.price) && update.price >= 0);
  const v = update.priceVerification;
  assert.ok(v && safeUrl(v.sourceUrl) && date(v.checkedAt) && v.sourceName && v.note);
  assert.ok(['online', 'store'].includes(v.channel));
  assert.ok(['official', 'platform'].includes(v.sourceKind));
  assert.ok(['exact', 'from'].includes(v.qualifier));
  const base = menus.find(m => m.id === update.id);
  const venue = restaurants.find(r => r.id === base.restaurantId);
  assert.equal(v.restaurantId, venue.id, 'Price evidence must match the branch');
  assert.equal(v.restaurantName, venue.name, 'Price branch name mismatch');
  assert.ok(v.sourceAddress && v.publishedMenuName, 'Source address and actual published menu name required');
  assert.ok(!update.photoReferenceUrl || (safeUrl(update.photoReferenceUrl) && update.photoReferenceLabel));
  assert.ok(update.descriptionUpdate.text && safeUrl(update.descriptionUpdate.sourceUrl) && date(update.descriptionUpdate.checkedAt));
  assert.ok(Object.keys(update).every(k => ['id','price','priceVerification','descriptionUpdate','photoReferenceUrl','photoReferenceLabel'].includes(k)), 'Enrichment cannot override ingredient or photo consent evidence');
}
console.log(`Validated ${updates.length} menu enrichments`);
