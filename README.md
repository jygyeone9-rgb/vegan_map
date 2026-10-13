# 초록 한 끼 — 서울 비건 지도 🌱

React + Vite + Leaflet으로 만든 서울 비건 식당 지도 프로토타입입니다.

## 주요 기능
- 지도 핀과 식당 목록, 키워드 검색
- 지역/음식 종류 필터 및 인터뷰가 있는 식당 보기
- 상세 패널의 메뉴·가격·재료 확인 상태·방문 정보
- 네이버 지도 및 Google Maps 검색 링크
- 모바일 반응형 레이아웃

## 로컬 실행
Node.js 18 이상 설치 후:
```bash
npm install
npm run dev
```
빌드 확인: `npm run build`

## 데이터와 제보
`src/data.js`에 있는 세 장소는 UI 확인용 샘플이며 실제 업체가 아닙니다. 공개 전에 실제 식당명, 주소, 좌표, 메뉴, 가격, 비건 여부, 리뷰 링크로 교체하세요. 재료가 확인되지 않은 메뉴는 미확인으로 표시하고, 인터뷰/사진은 공개 동의를 확인하세요. 제보 링크는 실제 Google Form을 만든 뒤 `src/App.jsx`의 `FORM_URL`을 교체해야 합니다.

정적 사이트이므로 제보를 자동 저장하지 않습니다. 초기에는 Google Forms와 수동 검증·반영 방식을 권장합니다.

## GitHub Pages 배포
이 저장소에는 GitHub Actions 배포 워크플로가 포함되어 있습니다. 저장소 Settings → Pages → Build and deployment에서 Source를 **GitHub Actions**로 선택하세요. main 브랜치에 push하면 빌드 후 배포됩니다.