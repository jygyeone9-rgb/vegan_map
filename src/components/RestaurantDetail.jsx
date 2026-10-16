import { useEffect, useRef } from 'react';
import { Heart, X } from 'lucide-react';
import MenuCard from './MenuCard.jsx';
import { publicInterviews, safeUrl, venueLabels } from '../lib/catalog.js';
export function Interview({ interview }) {
  return <article className="interview"><small>운영자 인터뷰 · {interview.date} · {interview.interviewer}</small><h3>{interview.title}</h3><p>{interview.summary}</p>{safeUrl(interview.photoUrl) && interview.photoConsent && <img className="interview-photo" src={safeUrl(interview.photoUrl)} alt={interview.photoAlt || '인터뷰 현장'} loading="lazy"/>}<details><summary>인터뷰 전문 읽기</summary>{interview.questions.map((q,index) => <div className="qa" key={index}><strong>Q. {q.question}</strong><p>{q.answer}</p></div>)}</details></article>;
}
export default function RestaurantDetail({ restaurant: r, menus, interviews, favorite, onToggle, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    const element = dialog.current;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const stories = publicInterviews(interviews).filter(i => i.restaurantId === r.id);
  const links = [['naver','네이버 지도·리뷰'],['google','Google Maps·리뷰'],['website','공식 홈페이지'],['instagram','공식 SNS']].filter(([key]) => safeUrl(r.links[key]));
  return <dialog ref={dialog} className="detail-dialog" aria-labelledby="detail-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="detail-inner">
    <button className="close" autoFocus onClick={onClose} aria-label="상세 닫기"><X/></button><div className="detail-hero">✳<span>PLACE NOTE · {r.district}</span></div>
    <div className="detail-body"><small className="kicker">VEGAN SEOUL / {r.branch}</small><h2 id="detail-title">{r.name}</h2><button className="save-button" aria-pressed={favorite} onClick={() => onToggle(r.id)}><Heart size={16} fill={favorite?'currentColor':'none'}/>{favorite?'즐겨찾기 해제':'즐겨찾기 저장'}</button>
      <div className="badges"><span className="badge">{r.category}</span><span className="badge">{venueLabels[r.venueType]}</span></div><p>{r.description}</p>{r.isSample && <p className="warning">실제 업체가 아닌 화면 확인용 샘플입니다. 지도 좌표도 예시입니다.</p>}
      <section className="detail-section"><h3>01　메뉴와 재료</h3>{menus.filter(m => m.restaurantId === r.id && m.available !== false).map(menu => <MenuCard key={menu.id} menu={menu}/>)}</section>
      <section className="detail-section"><h3>02　식당 이야기</h3>{stories.length ? stories.map(i => <Interview key={i.id} interview={i}/>) : <p className="empty-state">공개 동의를 받은 인터뷰를 준비하고 있어요.</p>}</section>
      <section className="detail-section"><h3>03　방문 정보</h3><dl className="menu-facts"><dt>주소</dt><dd>{r.address}</dd><dt>가까운 역</dt><dd>{r.stations.join(' · ')}</dd><dt>영업시간</dt><dd>{r.hours}</dd><dt>휴무일</dt><dd>{r.closedDays}</dd><dt>확인 방법</dt><dd>{r.verification.method}</dd><dt>마지막 확인</dt><dd>{r.verification.checkedAt || '확인 전'}</dd></dl>{safeUrl(r.verification.sourceUrl) && <a href={safeUrl(r.verification.sourceUrl)} target="_blank" rel="noopener noreferrer">방문 정보 출처 ↗</a>}</section>
      <section className="detail-section"><h3>04　리뷰와 공식 정보</h3><div className="review-links">{links.map(([key,label]) => <a key={key} href={safeUrl(r.links[key])} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>{!links.length && <p>정확한 지점 링크를 확인하고 있어요.</p>}<p className="filter-note">가격·영업시간·메뉴는 변경될 수 있습니다. 방문 전 공식 채널에서 다시 확인해 주세요.</p></section>
    </div></div>
  </dialog>;
}
