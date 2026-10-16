import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
const pin = L.divIcon({ className: 'pin-wrap', html: '<div class="pin">✳</div>', iconSize: [32,38], iconAnchor: [16,34] });
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
      {restaurants.map(r => <Marker key={r.id} position={[r.lat,r.lng]} icon={pin} title={r.name}><Popup><strong>{r.name}</strong><p>{r.neighborhood}{r.isSample ? ' · 가상 위치 예시' : ''}</p><button onClick={() => onSelect(r)}>상세 정보 보기</button></Popup></Marker>)}
    </MapContainer><div className="legend">✳　{restaurants.length ? '핀을 눌러 메뉴와 확인 근거를 살펴보세요' : '조건에 맞는 식당이 없어요'}</div>
  </div>;
}
