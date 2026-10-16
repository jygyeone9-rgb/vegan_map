export const dietLabels = { vegan: '비건', lacto: '락토', ovo: '오보', 'lacto-ovo': '락토오보', pesco: '페스코' };
export const venueLabels = { vegan: '완전 비건 전문점', options: '비건 메뉴 판매점', pending: '운영 형태 확인 중' };
export const defaults = { query: '', district: '', station: '', category: '', diet: '', price: '', venue: '', interview: false, favorites: false, hanyang: false };
export const formatPrice = price => Number.isFinite(price) ? `${price.toLocaleString('ko-KR')}원` : '가격 확인 중';
export const safeUrl = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; } };
export function isVerified(menu) {
  return menu.verification?.status === 'verified' && !!menu.verification.checkedAt && !!menu.verification.method && !!safeUrl(menu.verification.sourceUrl) && menu.ingredients.length > 0;
}
export const publicInterviews = interviews => interviews.filter(i => i.status === 'published' && i.consent === true && i.date);
export function menuMatches(menu, filters) {
  if (menu.available === false) return false;
  if (filters.diet && (!isVerified(menu) || !menu.dietTypes.includes(filters.diet))) return false;
  if (filters.price && (!Number.isFinite(menu.price) || menu.price > Number(filters.price))) return false;
  return true;
}
export function searchCatalog(restaurants, menus, interviews, filters, favorites = []) {
  const q = filters.query.trim().toLocaleLowerCase();
  const published = publicInterviews(interviews);
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
    const matchingMenus = menus.filter(menu => menu.restaurantId === restaurant.id && menuMatches(menu, filters) && (!q || placeText.includes(q) || [menu.name, ...menu.ingredients].join(' ').toLocaleLowerCase().includes(q)));
    // Price and diet must match the same menu. Never combine conditions from different menus.
    if ((filters.diet || filters.price || q) && !matchingMenus.length && !(q && placeText.includes(q) && !filters.diet && !filters.price)) continue;
    rows.push({ restaurant, menus: matchingMenus });
  }
  return rows;
}
