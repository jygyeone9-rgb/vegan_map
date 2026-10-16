import { Search, SlidersHorizontal } from 'lucide-react';
import { defaults, dietLabels, venueLabels } from '../lib/catalog.js';
export default function Filters({ filters, setFilters, restaurants, favoriteCount }) {
  const update = (key, value) => setFilters(current => ({ ...current, [key]: value }));
  const select = (key, label, values) => <label className="field-label">{label}<select value={filters[key]} disabled={!values.length} onChange={event => update(key, event.target.value)}><option value="">{values.length ? '전체' : '자료 미수록'}</option>{values.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label>;
  const distinct = key => [...new Set(restaurants.flatMap(r => r[key]))].sort().map(value => [value, value]);
  return <div className="filters"><label className="search"><Search size={18}/><input aria-label="식당·메뉴·지역 검색" value={filters.query} onChange={e => update('query', e.target.value)} placeholder="식당, 메뉴, 동네, 지하철역"/></label>
    <div className="filter-label"><SlidersHorizontal size={14}/> 나에게 맞는 한 끼 <button className="text-button" onClick={() => setFilters({ ...defaults })}>초기화</button></div>
    <div className="filter-grid">{select('district', '자치구', distinct('district'))}{select('station', '지하철역', distinct('stations'))}{select('category', '업종', distinct('category'))}{select('venue', '전문·가능 구분', Object.entries(venueLabels))}{select('diet', '채식 유형 5가지', Object.entries(dietLabels))}{select('price', '메뉴 가격', [['10000','1만 원 이하'],['15000','1만 5천 원 이하'],['20000','2만 원 이하']])}</div>
    <div className="check-filters">{[['hanyang','한양대 인접 권역 (왕십리·행당·성수)'],['verifiedOnly','재료를 개별 재확인한 메뉴만'],['interview','공개 인터뷰가 있는 곳'],['favorites',`즐겨찾기만 보기 (${favoriteCount})`]].map(([key,label]) => <label key={key}><input type="checkbox" checked={filters[key]} onChange={e => update(key,e.target.checked)}/>{label}</label>)}</div>
    <p className="filter-note">메뉴별 채식 유형을 기준으로 검색합니다. 확인된 페스코 메뉴는 아직 없습니다. 가격 조건 적용 시 가격 미확인 메뉴가 제외됩니다.</p>
  </div>;
}
