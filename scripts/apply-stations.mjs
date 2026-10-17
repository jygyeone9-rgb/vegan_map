import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceUrl = 'https://t-data.seoul.go.kr/dataprovide/download.do?id=10229';
const metadataUrl = 'https://t-data.seoul.go.kr/dataprovide/trafficdataviewfile.do?data_id=36&tr_code=sweb&tr_code=tcontents';
const checkedAt = '2026-10-17';
const csv = await fetch(sourceUrl).then(response => {
  if (!response.ok) throw new Error(`Station data download failed: ${response.status}`);
  return response.text();
});
const [header, ...lines] = csv.trim().split(/\r?\n/);
if (!header?.includes('역한글명칭') || !header.includes('환승역X좌표')) throw new Error('Unexpected Seoul station CSV format');

const entries = lines.map(line => {
  const [code, name, route, lng, lat] = line.split(',');
  return { code, name: name?.trim(), route: route?.trim(), lng: Number(lng), lat: Number(lat) };
}).filter(s => s.name && Number.isFinite(s.lat) && Number.isFinite(s.lng)
  && s.lat >= 37.4 && s.lat <= 37.75 && s.lng >= 126.7 && s.lng <= 127.25);

// The official master has one row per route. Nearby records with the same
// station name are merged so interchanges appear once, while same-name stations
// in different cities remain separate.
const grouped = [];
const radians = degrees => degrees * Math.PI / 180;
const distanceMeters = (a, b) => {
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const arc = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371000 * 2 * Math.asin(Math.sqrt(arc)));
};
for (const entry of entries) {
  const station = grouped.find(s => s.name === entry.name && distanceMeters(s, entry) <= 350);
  if (!station) {
    grouped.push({ name: entry.name, lat: entry.lat, lng: entry.lng, count: 1, lines: new Set([entry.route]) });
    continue;
  }
  station.lat = (station.lat * station.count + entry.lat) / (station.count + 1);
  station.lng = (station.lng * station.count + entry.lng) / (station.count + 1);
  station.count++;
  station.lines.add(entry.route);
}
const stations = grouped.map(({ count, ...s }) => ({ ...s, lines: [...s.lines].sort() }));
const restaurantsPath = path.join(root, 'src/data/restaurants.json');
const restaurants = JSON.parse(await fs.readFile(restaurantsPath, 'utf8'));
for (const restaurant of restaurants) {
  const nearby = stations.map(station => ({ station, distanceMeters: distanceMeters(restaurant, station) }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .filter(({ distanceMeters }) => distanceMeters <= 2200)
    .slice(0, 3);
  restaurant.stations = [...new Set(nearby.map(({ station }) => station.name))];
  restaurant.stationDetails = nearby.map(({ station, distanceMeters }) => ({
    name: station.name,
    distanceMeters,
    lines: station.lines,
  }));
}

await fs.writeFile(restaurantsPath, `${JSON.stringify(restaurants, null, 2)}\n`);
await fs.writeFile(path.join(root, 'src/data/subway-stations.json'), `${JSON.stringify({
  sourceName: '서울교통빅데이터플랫폼 지하철역_GEOM (역사마스터)',
  sourceUrl: metadataUrl,
  downloadUrl: sourceUrl,
  checkedAt,
  distanceMethod: '직선거리 하버사인 계산 · 역 좌표에서 2.2km 이내의 가까운 역 최대 3곳',
  stations,
}, null, 2)}\n`);
console.log(`Applied nearest subway stations for ${restaurants.length} restaurants from ${stations.length} official station coordinate points.`);
