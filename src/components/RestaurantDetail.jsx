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
      <div className="badges"><span className="badge">{r.category}</span><span className={'badge venue-badge '+r.venueType}>{venueLabels[r.venueType]}</span></div><p>{r.district} {r.neighborhood}에 위치한 {r.category}입니다.</p><p className="source-note">현재 영업·판매 여부와 재료는 방문 전 확인해 주세요. 채식 전문점에서도 메뉴별 채식 유형을 확인해 주세요.</p>{r.location?.status === 'address-differs' && <div className="warning address-warning"><strong>주소 재확인 필요</strong><p>등록 주소: {r.address}</p><p>지도에 표시한 주소: {r.location.address}</p><p>{r.location.note.replaceAll('PDF', '등록된')}</p></div>}
      <section className="detail-section"><h3>01　메뉴와 재료</h3>{menus.filter(m => m.restaurantId === r.id && m.available !== false).map(menu => <MenuCard key={menu.id} menu={menu}/>)}</section>
      <section className="detail-section"><h3>02　식당 이야기</h3>{stories.length ? stories.map(i => <Interview key={i.id} interview={i}/>) : <p className="empty-state">공개 동의를 받은 인터뷰를 준비하고 있어요.</p>}</section>
      <section className="detail-section"><h3>03　방문 정보와 자료 출처</h3><dl className="menu-facts"><dt>등록 주소</dt><dd>{r.address}</dd><dt>연락처</dt><dd>{r.phone || '자료 미수록'}</dd><dt>가까운 역</dt><dd>{r.stationDetails?.length ? r.stationDetails.map(s => `${s.name} ${s.distanceMeters >= 1000 ? `${(s.distanceMeters / 1000).toFixed(1)}km` : `${s.distanceMeters}m`} (${s.lines.join(', ')})`).join(' · ') : r.stations.join(' · ') || '자료 미수록'}<small className="station-note">공개 역 좌표와 식당 좌표 사이 직선거리 기준 · 도보 길이와 다를 수 있음</small></dd><dt>영업시간</dt><dd>{r.hours}</dd><dt>휴무일</dt><dd>{r.closedDays}</dd><dt>확인 방법</dt><dd>{r.verification.status === 'documented' ? '등록 자료 기준 분류' : r.verification.method}</dd><dt>자료 기준</dt><dd>2025년 10월 조사 · 2025년 11월 발행</dd><dt>개별 확인일</dt><dd>{r.verification.checkedAt || '아직 개별 재확인하지 않음'}</dd><dt>좌표 출처</dt><dd>{r.location?.provider}</dd></dl>{r.verification.status !== 'documented' && safeUrl(r.verification.sourceUrl) && <a className="text-button" href={safeUrl(r.verification.sourceUrl)} target="_blank" rel="noopener noreferrer">확인 근거 보기 ↗</a>}{safeUrl(r.location?.url) && <p><a className="text-button" href={safeUrl(r.location.url)} target="_blank" rel="noopener noreferrer">좌표 출처 보기 ↗</a></p>}<p><a className="text-button" href="https://t-data.seoul.go.kr/dataprovide/trafficdataviewfile.do?data_id=36&tr_code=sweb&tr_code=tcontents" target="_blank" rel="noopener noreferrer">서울시 교통빅데이터 지하철역 좌표자료 (2026-10-15 갱신) ↗</a></p></section>
      <section className="detail-section"><h3>04　리뷰와 공식 정보</h3><div className="review-links">{links.map(([key,label]) => <a key={key} href={safeUrl(r.links[key])} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div><p className="filter-note">정확한 지점 리뷰 링크는 확인 후 추가합니다. 아래 검색에서는 식당명과 등록 주소가 일치하는지 확인해 주세요.</p><div className="review-links"><a href={`https://map.naver.com/p/search/${encodeURIComponent(r.name+' '+r.address)}`} target="_blank" rel="noopener noreferrer">네이버 지도에서 이름·주소 검색 ↗</a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name+' '+r.address)}`} target="_blank" rel="noopener noreferrer">Google Maps에서 이름·주소 검색 ↗</a></div><p className="filter-note">가격·영업시간·메뉴는 변경될 수 있습니다. 방문 전 공식 채널에서 다시 확인해 주세요.</p></section>
    </div></div>
  </dialog>;
}
