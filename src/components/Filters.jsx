import { Search, SlidersHorizontal } from 'lucide-react';
import { defaults, dietLabels, venueLabels } from '../lib/catalog.js';
export default function Filters({ filters, setFilters, restaurants, favoriteCount }) {
  const update = (key, value) => setFilters(current => ({ ...current, [key]: value }));
  const select = (key, label, values) => <label className="field-label">{label}<select value={filters[key]} onChange={event => update(key, event.target.value)}><option value="">전체</option>{values.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label>;
  const distinct = key => [...new Set(restaurants.flatMap(r => r[key]))].sort().map(value => [value, value]);
  return <div className="filters"><label className="search"><Search size={18}/><input aria-label="식당·메뉴·지역 검색" value={filters.query} onChange={e => update('query', e.target.value)} placeholder="식당, 메뉴, 동네, 지하철역"/></label>
    <div className="filter-label"><SlidersHorizontal size={14}/> 나에게 맞는 한 끼 <button className="text-button" onClick={() => setFilters({ ...defaults })}>초기화</button></div>
    <div className="filter-grid">{select('district', '자치구', distinct('district'))}{select('station', '지하철역', distinct('stations'))}{select('category', '음식 종류', ['한식','양식','일식','중식','카페·베이커리','기타'].map(c => [c,c]))}{select('venue', '식당 구분', Object.entries(venueLabels))}{select('diet', '메뉴 채식 유형', Object.entries(dietLabels))}{select('price', '메뉴 가격', [['10000','1만 원 이하'],['15000','1만 5천 원 이하'],['20000','2만 원 이하']])}</div>
    <div className="check-filters">{[['hanyang','한양대학교 주변'],['interview','공개 인터뷰가 있는 곳'],['favorites',`즐겨찾기만 보기 (${favoriteCount})`]].map(([key,label]) => <label key={key}><input type="checkbox" checked={filters[key]} onChange={e => update(key,e.target.checked)}/>{label}</label>)}</div>
    <p className="filter-note">채식 유형은 재료 확인이 완료된 메뉴만 검색합니다. 가격 미확인 메뉴는 가격 필터에서 제외됩니다.</p>
  </div>;
}
