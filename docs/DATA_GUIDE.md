# 조사·검수·공개 운영 가이드

## 파일 역할
- `src/data/restaurants.json`: 식당의 고유 ID, 지점, 위치, 영업 정보, 공식 지점 링크.
- `src/data/menus.json`: `restaurantId`로 식당과 연결되는 메뉴. 가격, 재료, 채식 유형, 확인 근거, 교차접촉, 주문 유의사항.
- `src/data/interviews.json`: 식당별 인터뷰. 공개 동의와 상태를 통과한 내용만 화면에 표시.
- `src/config.js`: 실제 Google Forms 접수 주소와 캠페인 안내·QR 이미지.

현재 3곳·4개 메뉴는 기존 프로토타입의 가상 데이터입니다. 실제 자료로 오인하지 않도록 `isSample: true`, 빈 채식 유형, `pending` 상태를 사용합니다. 가짜 가격·검증일·인터뷰는 입력하지 않습니다.

## 조사표 권장 열
식당 ID / 식당명 / 지점 / 자치구 / 동네 / 주소 / 위도 / 경도 / 지하철역 / 음식 종류 / 운영 형태 / 영업시간 / 휴무일 / 메뉴 ID / 메뉴명 / 가격(KRW) / 재료 / 채식 유형 / 육수·소스·조미료 확인 내용 / 교차접촉 / 주문 유의사항 / 공식 출처 URL / 확인 방법 / 확인일 / 검수 상태 / 사진 공개 동의.

Google Sheets는 내부 조사표로 사용합니다. 공개 시트를 직접 읽거나 제보를 자동 반영하지 않습니다. 운영진이 확인한 항목을 JSON으로 옮긴 뒤 `npm test`로 검수합니다. 개인정보와 비공개 인터뷰 원문은 저장소에 넣지 않습니다.

## 검증 규칙
`verification.status`: `pending`(확인 중), `verified`(확인 완료), `recheck`(재확인).
`verification.method`: 공식 메뉴판, 업체 직접 답변 등 확인 방법.
`verification.checkedAt`: YYYY-MM-DD 또는 미확인 시 null.
`verification.sourceUrl`: HTTPS 근거 링크. 직접 답변은 동의받아 게시한 공개 확인 요약에 연결하고 개인 연락처를 올리지 않습니다.
`verification.ingredientNotes`: 메뉴의 육수·소스·조미료를 포함한 확인 결과.

메뉴 확인 완료에는 확인일·방법·출처·재료 목록이 모두 필요합니다. `dietTypes`는 검수자가 재료를 보고 명시적으로 지정합니다. 메뉴명으로 자동 추론하거나 상위 식단 유형을 자동 추가하지 않습니다. 검색은 지정된 태그의 일치 여부를 사용합니다.

- `vegan`: 동물성 식품 없음(꿀·젤라틴 등도 확인).
- `lacto`: 유제품 허용, 달걀·육류·생선 제외.
- `ovo`: 달걀 허용, 유제품·육류·생선 제외.
- `lacto-ovo`: 유제품·달걀 허용, 육류·생선 제외.
- `pesco`: 생선·해산물 허용, 육류 제외. 개인 기준 차이를 명시.

`crossContact`: `unknown`(미확인), `possible`(가능성 있음), `none`(업체가 없다고 안내). 재료의 비건 여부와 별도로 기록하며 알레르기 안전 보증으로 사용하지 않습니다.
가격은 원 단위 정수, 미확인은 `null`입니다. 가격 필터는 미확인 메뉴를 제외합니다. 판매 중단 메뉴는 `available: false`. 식당 운영 형태(`venueType`)는 `vegan`, `options`, `pending`으로 구분합니다. 특정 메뉴가 비건이어도 식당 전체를 비건 전문점으로 분류하지 않습니다.

## 인터뷰 형식
```json
{
  "id": "interview-001",
  "restaurantId": "실제-식당-id",
  "status": "draft",
  "consent": false,
  "date": null,
  "interviewer": "담당자 공개명",
  "title": "인터뷰 제목",
  "summary": "핵심 요약",
  "photoUrl": "",
  "photoAlt": "",
  "photoConsent": false,
  "questions": [{"question": "비건 메뉴를 시작한 계기는?", "answer": "실제 답변"}]
}
```
실제 답변·날짜·공개 동의를 확보한 뒤 `status: published`, `consent: true`로 전환합니다. 메뉴·인터뷰 사진도 URL, 대체 텍스트, 공개 동의가 필요합니다.

## 공개 전 확인
1. 샘플을 실제 조사 데이터로 교체하고 주소·좌표·지점 일치를 확인.
2. 육수·소스·조미료와 교차접촉을 구분하여 기록.
3. 네이버·Google 링크는 검색 결과가 아닌 정확한 지점 링크로 등록.
4. Forms에서 제보 항목 및 필요한 개인정보 안내를 구성하고 `reportFormUrl` 연결.
5. 캠페인 URL과 동일한 목적지의 QR 이미지를 준비해 설정. 외부 QR 생성 서비스로 이용자 데이터를 전송하지 않음.
6. `npm test`, `npm run build` 통과 후 검수된 변경을 커밋.

접속·참여·제보 집계는 아직 연결하지 않았습니다. 정적 페이지에서 가짜 수치나 탄소 감축량을 만들지 않습니다. 업데이트 주기와 재확인 담당자를 정해 운영하세요.
