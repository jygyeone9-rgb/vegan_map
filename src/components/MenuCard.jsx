import { Utensils } from 'lucide-react';
import { dietLabels, formatPrice, isVerified, safeUrl } from '../lib/catalog.js';
export default function MenuCard({ menu, restaurant, onSelect }) {
  const verified = isVerified(menu);
  const photo = menu.photoConsent && safeUrl(menu.photoUrl);
  return <article className="menu-card">
    <div className="menu-art">{photo ? <img src={photo} alt={menu.photoAlt || menu.name} loading="lazy"/> : <><Utensils size={30}/><small>메뉴 사진 준비 중</small></>}</div>
    <div className="menu-content">{restaurant && <button className="text-button" onClick={() => onSelect(restaurant)}>{restaurant.name} ↗</button>}
      <h3>{menu.name}</h3><strong>{formatPrice(menu.price)}</strong><p>{menu.description}</p>
      <div className="badges"><span className={'badge '+(verified?'':'amber')}>{verified ? '재료 확인 완료' : '확인 중'}</span>{verified && menu.dietTypes.map(type => <span className="badge" key={type}>{dietLabels[type]}</span>)}</div>
      <dl className="menu-facts"><dt>주요 재료</dt><dd>{menu.ingredients.length ? menu.ingredients.join(', ') : '재료 확인 전'}</dd><dt>재료 확인</dt><dd>{menu.verification.ingredientNotes}</dd><dt>주문 시 참고</dt><dd>{menu.orderNotes}</dd><dt>교차접촉</dt><dd>{{unknown:'확인되지 않음',possible:'공동 조리 환경으로 접촉 가능',none:'업체에서 접촉 없음으로 안내'}[menu.crossContact]}</dd><dt>확인 방법</dt><dd>{menu.verification.method}</dd><dt>마지막 확인</dt><dd>{menu.verification.checkedAt || '확인 전'}</dd></dl>
      {safeUrl(menu.verification.sourceUrl) && <a className="text-button" href={safeUrl(menu.verification.sourceUrl)} target="_blank" rel="noopener noreferrer">확인 근거 보기 ↗</a>}
    </div>
  </article>;
}
