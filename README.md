# VEGAN SEOUL — 서울 비건 한 끼 지도

한양대학교 주변에서 서울 전역으로 확장하는 React + JSX / Vite / Leaflet / OpenStreetMap 정적 웹사이트입니다. 기존 프로토타입의 지도와 색상·일러스트 방향을 유지하면서 기획서의 메뉴 탐색, 저장, 인터뷰, 캠페인, 제보 구조를 확장했습니다.

## 실행
Node.js 22 이상을 사용하세요.
```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## 구현 범위
- 지도와 동일한 결과를 사용하는 식당 목록, 마커 팝업, 상세 화면.
- 식당·메뉴·재료·동네 검색, 자치구·역·음식 종류·운영 형태·메뉴 가격·채식 유형 필터.
- 한양대 주변, 공개 인터뷰, 즐겨찾기 필터.
- 메뉴별 재료·가격·채식 유형·출처·확인 방법·확인일·교차접촉·주문 유의사항.
- localStorage 즐겨찾기, 저장 실패 안내 및 같은 브라우저 탭 간 동기화.
- 공개 동의가 있는 인터뷰 요약·전문·사진, 정확한 지점 리뷰·공식 링크.
- 캠페인 소개·등록 지표, 실제 Forms/캠페인 URL/QR을 연결할 수 있는 설정.
- 모바일 메뉴, 키보드 포커스, 본문 건너뛰기, Escape로 닫는 상세 dialog.
- hash 경로: `#map`, `#menus`, `#stories`, `#campaign`, `#report`, `#map/sample-01`. 새로고침과 직접 링크가 GitHub Pages에서 동작합니다.

## 저장소 구조
```text
src/
  App.jsx                      페이지·필터 상태와 hash 경로
  components/
    Filters.jsx                검색 및 필터
    RestaurantMap.jsx          지도 마커·뷰포트
    RestaurantDetail.jsx       메뉴·인터뷰·방문 정보 dialog
    MenuCard.jsx               메뉴 확인 정보
  data/
    restaurants.json           식당 정보
    menus.json                 restaurantId로 연결한 메뉴
    interviews.json            동의·공개 상태를 가진 인터뷰
    index.js                   데이터 진입점
  hooks/useFavorites.js        브라우저 저장소
  lib/catalog.js               검색·가격·유형·검증 공통 규칙
  config.js                    제보·캠페인 주소 설정
  style.css                    기존 디자인 기반
  enhancements.css             확장 화면·반응형·접근성
scripts/validate-data.mjs       JSON 참조·근거·동의 검증
tests/catalog.test.js           검색 조건과 비공개 정보 회귀 테스트
docs/DATA_GUIDE.md              조사표·등록·운영 안내
.github/workflows/deploy.yml    테스트 → 빌드 → Pages 배포
```

## 실제 운영 전 준비
현재 식당 3곳과 메뉴 4개는 **실제 업체가 아닌 가상 데이터**입니다. 실제 조사 요청을 수행한 것은 아니며 가격·식단 태그·검증일을 꾸며 넣지 않았습니다. 따라서 채식 유형/가격/공개 인터뷰 필터의 결과가 비어 있는 것이 정상입니다. 실제 가격·태그가 있는 테스트 데이터는 자동 테스트 안에만 있습니다.

`docs/DATA_GUIDE.md`에 따라 조사한 정보를 입력하세요. 실제 식당 등록 전 `isSample` 값을 변경하고 주소·좌표·지점 링크·재료 근거를 검수합니다. 공개할 근거가 없는 메뉴는 확인 중으로 남깁니다. 사진·인터뷰는 공개 동의를 확인한 뒤 등록합니다.

`src/config.js`의 `reportFormUrl`에 실제 Google Forms 주소를 연결해야 제보 버튼이 열립니다. 캠페인 안내와 QR도 실제 자료가 있을 때 설정합니다. Google Sheets 수집·Forms 자동 연동, 회원 계정, 관리자 기능, 방문·참여 분석은 포함하지 않습니다. 외부 연결을 설정하기 전에는 접수나 캠페인 참여가 완료되었다고 표시하지 않습니다.

## GitHub Pages
기존 `main` 배포 흐름을 사용하며 `vite.config.js`의 base는 `/vegan_map/`입니다. Settings → Pages → Source가 **GitHub Actions**로 설정되어야 합니다. 워크플로가 `npm ci`, 데이터 검증/테스트, 빌드를 통과하면 `dist`를 배포합니다. 다른 이름의 저장소에 옮기면 base를 변경하세요.

브라우저가 OpenStreetMap 타일 서버에 접속해야 지도 배경이 보입니다. 실패 시 목록으로 탐색할 수 있습니다. OSM 저작권 표시는 유지하고 대량 타일 다운로드/프리페치는 하지 않습니다.

구현 참고: [React Effect](https://react.dev/reference/react/useEffect), [Leaflet API](https://leafletjs.com/reference.html), [Vite GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages).
