import { Search, SlidersHorizontal } from 'lucide-react';
import { defaults, dietLabels, venueLabels } from '../lib/catalog.js';

export default function Filters({ filters, setFilters, restaurants, favoriteCount }) {
  const update = (key, value) => setFilters(current => ({ ...current, [key]: value }));
  const select = (key, label, values) => <label className="field-label">{label}<select value={filters[key]} disabled={!values.length} onChange={event => update(key, event.target.value)}><option value="">{values.length ? '전체' : '자료 미수록'}</option>{values.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label>;
  const distinct = key => [...new Set(restaurants.flatMap(r => r[key]))].sort().map(value => [value, value]);
  return <div className="filters">
    <label className="search"><Search size={18}/><input aria-label="식당·메뉴·지역 검색" value={filters.query} onChange={e => update('query', e.target.value)} placeholder="식당, 메뉴, 동네, 지하철역"/></label>
    <div className="filter-label"><SlidersHorizontal size={14}/> 나에게 맞는 한 끼 <button className="text-button" onClick={() => setFilters({ ...defaults })}>초기화</button></div>
    <div className="filter-grid">
      {select('district', '자치구', distinct('district'))}
      {select('station', '지하철역', distinct('stations'))}
      {select('category', '업종', distinct('category'))}
      {select('venue', '전문·가능 구분', Object.entries(venueLabels))}
      {select('diet', '채식 유형 5가지', Object.entries(dietLabels))}
      <label className="price-range"><span>메뉴 가격 범위</span><div><span className="price-value"><input aria-label="최저 가격" type="number" min="0" step="500" inputMode="numeric" placeholder="0" value={filters.priceMin} onChange={e => update('priceMin', e.target.value)}/><small>원</small></span><i>~</i><span className="price-value"><input aria-label="최고 가격" type="number" min="0" step="500" inputMode="numeric" placeholder="제한 없음" value={filters.priceMax} onChange={e => update('priceMax', e.target.value)}/><small>원</small></span></div></label>
    </div>
    <div className="check-filters">{[['pricedOnly','가격 자료 있는 메뉴만'],['hanyang','한양대 인접 권역 (왕십리·행당·성수)'],['verifiedOnly','재료를 개별 재확인한 메뉴만'],['interview','공개 인터뷰가 있는 곳'],['favorites',`즐겨찾기만 보기 (${favoriteCount})`]].map(([key,label]) => <label key={key}><input type="checkbox" checked={filters[key]} onChange={e => update(key,e.target.checked)}/>{label}</label>)}</div>
    <p className="filter-note">메뉴별 채식 유형과 입력한 가격 범위로 검색합니다. 가격을 모르는 메뉴와 ‘부터’로 표시된 가격은 범위 검색에서 제외됩니다. 재료 확인 여부는 가격 확인과 별도로 표시합니다.</p>
  </div>;
}
