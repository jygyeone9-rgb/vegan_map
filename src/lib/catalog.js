export const dietLabels = { vegan: '비건', lacto: '락토', ovo: '오보', 'lacto-ovo': '락토오보', pesco: '페스코' };
export const venueLabels = { specialist: '채식 전문', options: '채식 가능', vegan: '완전 비건 전문 (별도 확인)', pending: '운영 형태 확인 중' };
export const defaults = { query: '', district: '', station: '', category: '', diet: '', price: '', priceMin: '', priceMax: '', venue: '', interview: false, favorites: false, hanyang: false, verifiedOnly: false, pricedOnly: false };
export const handbookTags = { V: 'vegan', L: 'lacto', O: 'ovo', LO: 'lacto-ovo' };
export const formatPrice = price => Number.isFinite(price) ? `${price.toLocaleString('ko-KR')}원` : '가격 확인 중';
export const safeUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };
export function isVerified(menu) {
  return menu.verification?.status === 'verified' && !!menu.verification.checkedAt && !!menu.verification.method && !!safeUrl(menu.verification.sourceUrl) && menu.ingredients.length > 0;
}
export function isDocumented(menu) {
  const v = menu.verification;
  return v?.status === 'documented' && v.sourceId === 'seoul-handbook-2025' &&
    Number.isInteger(v.pdfPage) && v.pdfPage >= 12 && v.pdfPage <= 61 &&
    Number.isInteger(v.printedPage) && v.printedPage >= 20 && v.printedPage <= 118 &&
    !!safeUrl(v.sourceUrl) && handbookTags[menu.sourceTag] === menu.documentedDietType;
}
export function isVendorListed(menu) {
  const v = menu.verification;
  return v?.status === 'listed' && Object.hasOwn(dietLabels, menu.documentedDietType) &&
    menu.sourceTag === 'V' && !!safeUrl(v.sourceUrl);
}
export function getDietTypes(menu) {
  if (isVerified(menu)) return menu.dietTypes;
  if (isVendorListed(menu)) return [menu.documentedDietType];
  return isDocumented(menu) ? [menu.documentedDietType] : [];
}
export function getPhotoUrl(menu) {
  return menu.photoConsent === true && !!menu.photoAlt && !!safeUrl(menu.photoSourceUrl) ? safeUrl(menu.photoUrl) : '';
}
export const publicInterviews = interviews => interviews.filter(i => i.status === 'published' && i.consent === true && i.date);
export function menuMatches(menu, filters) {
  if (menu.available === false) return false;
  if (filters.verifiedOnly && !isVerified(menu)) return false;
  if (filters.pricedOnly && (!Number.isFinite(menu.price) || !safeUrl(menu.priceVerification?.sourceUrl))) return false;
  if (filters.diet && !getDietTypes(menu).includes(filters.diet)) return false;
  const min = filters.priceMin === '' || filters.priceMin == null ? null : Number(filters.priceMin);
  const max = filters.priceMax === '' || filters.priceMax == null ? null : Number(filters.priceMax);
  const hasRange = min !== null || max !== null;
  if (filters.price && (!Number.isFinite(menu.price) || menu.priceVerification?.qualifier === 'from' || menu.price > Number(filters.price))) return false;
  if (hasRange && (!Number.isFinite(menu.price) || menu.priceVerification?.qualifier === 'from' || (min !== null && menu.price < min) || (max !== null && menu.price > max) || (min !== null && max !== null && min > max))) return false;
  return true;
}
export function searchCatalog(restaurants, menus, interviews, filters, favorites = []) {
  const q = filters.query.trim().toLocaleLowerCase();
  const published = publicInterviews(interviews);
  const menusByRestaurant = new Map();
  for (const menu of menus) {
    const list = menusByRestaurant.get(menu.restaurantId) || [];
    list.push(menu);
    menusByRestaurant.set(menu.restaurantId, list);
  }
  const rows = [];
  for (const restaurant of restaurants) {
    if (filters.district && restaurant.district !== filters.district) continue;
    if (filters.station && !restaurant.stations.includes(filters.station)) continue;
    if (filters.category && restaurant.category !== filters.category) continue;
    if (filters.venue && restaurant.venueType !== filters.venue) continue;
    if (filters.hanyang && !restaurant.nearHanyang) continue;
    if (filters.favorites && !favorites.includes(restaurant.id)) continue;
    if (filters.interview && !published.some(i => i.restaurantId === restaurant.id)) continue;
    const placeText = [restaurant.name, restaurant.branch, restaurant.district, restaurant.neighborhood, ...restaurant.stations, restaurant.category].join(' ').toLocaleLowerCase();
    const matchingMenus = (menusByRestaurant.get(restaurant.id) || []).filter(menu => menuMatches(menu, filters) && (!q || placeText.includes(q) || [menu.name, ...menu.ingredients].join(' ').toLocaleLowerCase().includes(q)));
    // Price and diet must match the same menu. Never combine conditions from different menus.
    const priceRange = (filters.priceMin !== '' && filters.priceMin != null) || (filters.priceMax !== '' && filters.priceMax != null);
    if ((filters.diet || filters.price || priceRange || filters.verifiedOnly || filters.pricedOnly || q) && !matchingMenus.length && !(q && placeText.includes(q) && !filters.diet && !filters.price && !priceRange && !filters.verifiedOnly && !filters.pricedOnly)) continue;
    rows.push({ restaurant, menus: matchingMenus });
  }
  return rows;
}

