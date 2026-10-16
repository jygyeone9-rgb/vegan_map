import { useState } from 'react';
import { dietLabels, formatPrice, getDietTypes, getPhotoUrl, isDocumented, isVerified, safeUrl } from '../lib/catalog.js';

export default function MenuCard({ menu, restaurant, onSelect }) {
  const verified = isVerified(menu), documented = isDocumented(menu);
  const photo = getPhotoUrl(menu);
  const [failedPhoto, setFailedPhoto] = useState('');
  const showPhoto = !!photo && failedPhoto !== photo;
  return <article className={'menu-card '+(showPhoto ? 'with-photo' : 'without-photo')}>
    {showPhoto && <figure className="menu-photo"><img src={photo} alt={menu.photoAlt} loading="lazy" onError={() => setFailedPhoto(photo)}/><figcaption><a href={safeUrl(menu.photoSourceUrl)} target="_blank" rel="noopener noreferrer">{menu.photoCredit || '사진 출처'} ↗</a></figcaption></figure>}
    <div className="menu-content">{restaurant && <button className="text-button" onClick={() => onSelect(restaurant)}>{restaurant.name} ↗</button>}
      <h3>{menu.name}</h3><strong>{formatPrice(menu.price)}</strong>
      {menu.priceVerification && <p className="price-source"><a href={safeUrl(menu.priceVerification.sourceUrl)} target="_blank" rel="noopener noreferrer">{menu.priceVerification.sourceName} 가격 ↗</a><br/>{menu.priceVerification.note}<br/>{menu.priceVerification.checkedAt} 페이지 확인</p>}
      {safeUrl(menu.photoReferenceUrl) && !photo && <a className="text-button" href={safeUrl(menu.photoReferenceUrl)} target="_blank" rel="noopener noreferrer">{menu.photoReferenceLabel} ↗</a>}<p>{menu.descriptionUpdate?.text || (documented ? `${dietLabels[menu.documentedDietType]} 유형의 메뉴입니다. 자세한 구성은 매장에 확인해 주세요.` : menu.description)}</p>
      <div className="badges">{getDietTypes(menu).map(type => <span className={'badge diet-'+type} key={type}>{dietLabels[type]}</span>)}<span className={'badge '+(verified ? '' : 'amber')}>{verified ? '재료 확인 완료' : documented ? '자료 표기 · 재료 재확인 필요' : '유형 확인 중'}</span></div>
      <p className="order-note">{menu.orderNotes.replaceAll('핸드북에 ', '')}</p>
      <details className="menu-evidence"><summary>재료·출처·확인 정보</summary><dl className="menu-facts"><dt>주요 재료</dt><dd>{menu.ingredients.length ? menu.ingredients.join(', ') : '자료 미수록'}</dd><dt>재료 확인</dt><dd>{documented ? '전체 재료와 육수·소스·조미료는 매장 확인 필요' : menu.verification.ingredientNotes}</dd><dt>현재 판매</dt><dd>{menu.available === null ? '재확인 필요' : menu.available ? '판매 중으로 확인' : '판매 중단'}</dd><dt>교차접촉</dt><dd>{{unknown:'확인되지 않음',possible:'공동 조리 환경으로 접촉 가능',none:'업체에서 접촉 없음으로 안내'}[menu.crossContact]}</dd><dt>확인 방법</dt><dd>{documented ? '등록 자료 기준 분류' : menu.verification.method}</dd>{documented && <><dt>자료 기준</dt><dd>2025년 10월 조사 · {menu.sourceTag} 표기</dd></>}<dt>개별 확인일</dt><dd>{menu.verification.checkedAt || '아직 개별 재확인하지 않음'}</dd></dl>
      {!documented && safeUrl(menu.verification.sourceUrl) && <a className="text-button" href={safeUrl(menu.verification.sourceUrl)} target="_blank" rel="noopener noreferrer">확인 근거 보기 ↗</a>}</details>
    </div>
  </article>;
}
