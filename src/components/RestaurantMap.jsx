import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { venueLabels } from '../lib/catalog.js';
const makePin = (type, label = '') => L.divIcon({ className: 'pin-wrap', html: `<div class="pin pin-${type}"><span class="${label ? 'pin-label' : 'pin-core'}">${label}</span></div>`, iconSize: [28,28], iconAnchor: [14,14], popupAnchor: [0,-16] });
const pins = { specialist: makePin('specialist'), vegan: makePin('specialist'), options: makePin('options'), pending: makePin('pending', '?'), review: makePin('review', '!') };
function FitResults({ restaurants }) {
  const map = useMap();
  useEffect(() => {
    if (restaurants.length) map.fitBounds(restaurants.map(r => [r.lat,r.lng]), { padding: [45,45], maxZoom: 14, animate: false });
  }, [map, restaurants]);
  return null;
}
export default function RestaurantMap({ restaurants, onSelect }) {
  const [tileError, setTileError] = useState(false);
  return <div className="map-area"><div className="map-caption"><span>SEOUL · 한양대에서 서울 전역으로</span><small>OPENSTREETMAP</small></div>
    {tileError && <p role="status" className="warning">지도 배경을 불러오지 못했어요. 식당 목록과 상세 정보는 계속 사용할 수 있습니다.</p>}
    <MapContainer center={[37.558,127.038]} zoom={12} scrollWheelZoom={false} className="map" aria-label="서울 식당 지도">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setTileError(true) }}/>
      <FitResults restaurants={restaurants}/>
      {restaurants.map(r => <Marker key={r.id} position={[r.lat,r.lng]} icon={r.location?.status === 'address-differs' ? pins.review : pins[r.venueType] || pins.pending} title={`${r.name} · ${venueLabels[r.venueType]}`}><Popup><strong>{r.name}</strong><p>{venueLabels[r.venueType]}</p><p>{r.neighborhood} · 2025년 10월 자료</p>{r.location?.status === 'address-differs' && <p>주소가 자료와 다릅니다. 현재 핀은 서울시 지도 주소 기준입니다.</p>}<button onClick={() => onSelect(r)}>메뉴·유형·상세 정보 보기</button></Popup></Marker>)}
    </MapContainer><div className="legend map-legend"><span className="legend-specialist">● 채식 전문</span><span className="legend-options">● 채식 가능</span><span className="legend-review">! 주소 재확인</span>{!restaurants.length && <span>조건에 맞는 식당이 없어요</span>}</div>
  </div>;
}
