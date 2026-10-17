# VEGAN SEOUL — 서울 비건 한 끼 지도

한양대학교 주변에서 서울 전역으로 확장하는 React + JSX / Vite / Leaflet / OpenStreetMap 정적 웹사이트입니다. 서울 25개 자치구의 **운영 목록 298곳·메뉴 840개**를 탐색하며, 가격 출처가 기록된 175곳의 249개 메뉴를 함께 표시합니다. 확인 근거가 있는 폐점 지점은 공개 목록에서 제외합니다.

## 실행
Node.js 22 이상:
```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## 데이터와 분류
- 조사 기준: **2025년 10월**.
- 채식 전문과 채식 가능 식당을 별도 지도 색상과 필터로 표시합니다.
- 5가지 메뉴 필터: 비건, 락토, 오보, 락토오보, 페스코. 현재 자료에는 페스코 유형이 없습니다.
- 원자료 메뉴 표기: 비건 788개, 락토 42개, 오보 2개, 락토오보 9개이며, 업체 메뉴에서 비건으로 표기된 추가 5개는 `listed` 상태로 구분합니다. 유형은 출처에 적힌 값을 검색하며 다른 유형으로 자동 확장하지 않습니다.
- **채식 전문은 완전 비건 전문 인증과 다릅니다.** 식당 운영 형태와 메뉴 유형은 분리합니다.
- 등록 자료의 유형은 `documented`, 재료를 개별 재확인한 것은 `verified`, 업체 메뉴에 비건으로 표기됐으나 재료 전체를 확인하지 않은 것은 `listed`로 구분합니다. 기본 검색은 출처 표기를 포함하고, ‘재료를 개별 재확인한 메뉴만’ 옵션으로 구분합니다.
- 가격·영업시간·전체 재료·교차접촉·가까운 역은 임의로 채우지 않습니다. 현재 판매 여부가 불명확한 메뉴는 방문 전 확인이 필요합니다.
- 가격은 별도 출처·조회일·지점·원문 메뉴명을 기록하며, 외부 플랫폼 가격은 현장 판매가를 보증하지 않습니다.

## 기능
지도·메뉴 탐색·식당 이야기·캠페인·식당 제보의 5개 화면, 식당명/메뉴명/지역 검색, 자치구·업종·전문/가능·채식 유형·가격 필터, 한양대 인접 권역 필터, 브라우저 즐겨찾기, 상세 메뉴·방문 정보·공식 SNS, 네이버/Google 지도 검색 링크를 제공합니다. 정확한 지점 리뷰 URL은 확보 시 별도로 등록합니다.

목록은 30개, 메뉴는 24개씩 더 볼 수 있으며 지도에는 필터에 맞는 모든 식당을 표시합니다. 모바일 레이아웃, 키보드 포커스, 본문 건너뛰기, Escape로 닫는 상세 dialog를 지원합니다. hash 경로(`#map`, `#menus`, `#map/seoul-280` 등)는 GitHub Pages에서 새로고침과 직접 연결이 가능합니다.

## 사진
메뉴와 정확히 대응하는 사용 가능한 사진이 확인되지 않아 현재는 **이미지 없이 설명만** 표시합니다. 사진 준비 중 아이콘·빈 사진 자리도 표시하지 않습니다. 사진을 등록하려면 사진 URL·메뉴에 맞는 대체 텍스트·원출처·사용 동의를 함께 입력합니다. 이미지 로딩 실패 시에도 사진 영역을 숨깁니다. 네이버/Google 지도 이용자 사진을 임의로 복제하거나 사진과 다른 메뉴에 붙이지 않습니다.

## 구조
```text
src/
  App.jsx                        화면·필터·경로·목록 표시 수
  components/                    검색, 지도, 식당 상세, 메뉴 카드
  data/
    restaurants.json             원자료 식당 300개
    menus.json                   원자료 메뉴 841개와 추가 메뉴 5개, restaurantId로 연결
    closed-restaurants.json      확인된 폐점 지점 공개 목록 제외 기록
    menu-enrichments.json        가격 자료 249개, 175개 지점
    interviews.json              공개 동의가 있는 인터뷰
    handbook-source.json         발행·조사 기준·범례·파일 해시
  hooks/useFavorites.js          브라우저 즐겨찾기
  lib/catalog.js                 검색·유형·자료/재확인 판정
  config.js                      실제 제보·캠페인 주소
scripts/
  validate-data.mjs              데이터 관계·출처·유형·사진 검증
  import-handbook.py             제공된 PDF의 재현 가능한 추출
  handbook-locations.json        PDF 번호와 대조한 좌표·출처
tests/catalog.test.js            검색 및 PDF 반영 회귀 테스트
docs/DATA_GUIDE.md                데이터 수정 방법
docs/IMPORT_NOTES.md              원자료 대조·차이·좌표 보완 내역
.github/workflows/deploy.yml      검증 → 테스트 → 빌드 → Pages
```

앱 실행에는 Python이 필요 없습니다. 원본 PDF를 다시 추출할 때만 `pdfplumber`가 필요합니다.
```bash
python scripts/import-handbook.py --pdf /path/to/handbook.pdf
npm test
```
추출 스크립트는 네트워크를 사용하지 않으며 검토된 좌표 파일과 PDF를 결합합니다. 재추출은 자료 상태로 되돌리므로 이후 수동 검수 변경은 먼저 보존하세요.

## 운영 설정과 배포
`src/config.js`의 `reportFormUrl`에 실제 Google Forms 주소를 연결해야 접수가 열립니다. 공개 동의를 확보한 인터뷰, 캠페인 일정/URL/QR은 자료가 마련되면 등록하세요. Google Sheets 수집·Forms 자동 연동, 계정·관리자 기능과 참여 분석은 포함하지 않습니다.

GitHub Pages: Settings → Pages → Source를 **GitHub Actions**로 설정하세요. `main`에 변경하면 `npm ci`, 테스트, 빌드를 거쳐 `dist`를 배포합니다. base는 `/vegan_map/`입니다. 초기 배포에서 Pages 미설정 오류가 확인되었으므로 설정 전에는 배포 완료로 보지 않습니다.

지도 타일은 OpenStreetMap을 사용합니다. 타일 접속 실패 시 목록과 메뉴 탐색을 계속 사용할 수 있습니다. 출처·저작권 표시는 유지하며 대량 다운로드나 프리페치는 하지 않습니다.

자료: [서울시 공식 배포처](https://fsi.seoul.go.kr/front/M0000070/board/view.do?atcSn=2283), [한국비건진흥원 안내](https://k-vegan.org/?page_id=4337&uid=644&mod=document&pageid=1), [스마트서울맵](https://map.seoul.go.kr/smgis2/seoulMap).

기술 참고: [React Effect](https://react.dev/reference/react/useEffect), [Leaflet](https://leafletjs.com/reference.html), [Vite Pages 배포](https://vite.dev/guide/static-deploy.html#github-pages).

