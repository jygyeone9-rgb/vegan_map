# 데이터 등록과 검수

## 식당과 메뉴는 별도로 관리
`restaurants.json`은 원자료 식당 위치·연락처·운영 형태, `menus.json`은 개별 메뉴 이름·유형·재료·가격을 저장합니다. 식당 ID와 메뉴의 `restaurantId`로 연결합니다. `closed-restaurants.json`은 폐점 근거가 확인된 지점을 앱 공개 목록에서 제외하고, `menu-enrichments.json`은 가격 출처를 기록합니다. 현재 공개 목록은 298곳·835개 메뉴이며 가격 자료는 100곳·174개 메뉴에 있습니다. 가격 보강은 재료 확인이나 채식 유형을 바꾸지 않습니다.

PDF에서 옮긴 항목은 `verification.status: documented`, 확인일은 `null`입니다. 조사 기준 월(2025-10)과 자료를 앱에 옮긴 시점, 업체에 다시 확인한 날짜는 다른 개념입니다. 월만 알려진 조사일에 임의의 일자를 만들지 않습니다.

## 유형과 근거
- `documentedDietType`: PDF가 명시한 유형. `sourceTag`는 V/L/O/LO 중 하나이고 페이지·식당 번호와 함께 저장합니다.
- `dietTypes`: 운영진이 재료를 개별 재확인한 유형. `verified`와 근거·확인일·재료가 갖춰져야 화면에 표시됩니다.
- `pending`: 자료나 재료 확인 중. 필터에서 확정 유형으로 검색되지 않습니다.
- `recheck`: 변경·오류 가능성이 있어 재확인이 필요함. 과거 태그를 그대로 확정 표시하지 않습니다.

`vegan`은 동물성 식품 제외(꿀·젤라틴도 확인), `lacto`는 유제품 허용, `ovo`는 달걀 허용, `lacto-ovo`는 둘 모두 허용, `pesco`는 생선·해산물 허용·육류 제외입니다. 개인별 기준 차이를 고려합니다. 태그는 자동 추론하거나 다른 허용 식단으로 자동 확장하지 않습니다. PDF는 페스코를 분류하지 않아 현재 페스코 데이터는 없습니다.

실제 재확인 완료로 바꾸려면 `verification.status`를 `verified`로 설정하고 `checkedAt`(YYYY-MM-DD), `method`, HTTPS `sourceUrl`, `ingredientNotes`, `ingredients`를 입력합니다. 모든 재료·육수·소스·조미료를 확인한 뒤 해당 `dietTypes`만 부여합니다. 확인 근거는 동의받아 공개한 업체 답변 요약 또는 공식 메뉴 자료에 연결합니다. 개인 연락처나 비공개 답변 원문은 저장소에 올리지 않습니다.

## 식당 운영 형태
`specialist`는 PDF의 **채식 전문**, `options`는 **채식 가능**입니다. 메뉴가 한 개 비건이거나 PDF가 채식 전문이라 해도 식당 전체를 `vegan`으로 바꾸지 않습니다. `vegan`은 별도의 개별 확인 근거가 필요합니다. 자료의 운영 형태와 실제 최신 운영 형태가 다르면 원자료 근거를 남기고 새 확인일과 상태를 기록합니다.

## 가격·판매·위치
가격은 원 단위 정수, 미확인은 `null`. 가격 미확인 메뉴는 가격 필터에서 제외됩니다. 현재 판매 여부는 `available: null`, 재확인 후 판매 중은 `true`, 중단은 `false`입니다. `crossContact`는 `unknown`/`possible`/`none`이며 재료 유형과 독립적으로 기록합니다.

`address`는 PDF 주소, `location.address`는 지도 좌표 출처의 주소입니다. 다르면 `location.status: address-differs`와 설명을 유지해 사용자가 알 수 있게 합니다. 동명 업체는 이름만으로 좌표를 복사하지 말고 주소·전화번호도 대조합니다.

폐점은 지점명과 주소가 맞는 출처에 명확히 표시된 경우에만 `closed-restaurants.json`에 넣습니다. 원자료 행은 보존하며 앱의 식당·메뉴 배열에서 해당 지점만 제외합니다. 단순한 정보 수정 제안 표시는 폐점 증거로 보지 않습니다.

한양대 인접 권역은 성동구 중 왕십리·행당·성수 주소 권역이며 도보 거리나 이동 시간을 뜻하지 않습니다. 가까운 역과 한식/양식 등 세부 업종은 PDF에 없어 추측하지 않았습니다. 지하철역 배열을 추가하면 역 필터가 자동으로 활성화됩니다. 현재 업종은 음식점과 카페·베이커리 구분입니다.

## 사진
사진이 없으면 `photoUrl: ""`로 두세요. 빈 사진 자리 없이 메뉴 설명을 보여줍니다. 사진 등록 시 `photoUrl`, `photoAlt`, `photoSourceUrl`, `photoCredit`, `photoConsent: true`를 함께 입력합니다. 메뉴와 지점의 일치, 사용 가능한 자료인지 확인하세요. 사진 URL 또는 원출처가 HTTPS가 아니거나 동의가 없으면 표시하지 않습니다. 사진을 불러오지 못해도 설명은 유지합니다.

## 인터뷰와 제보
`interviews.json`의 항목에는 `id`, `restaurantId`, `status`, `consent`, `date`, `interviewer`, `title`, `summary`, `questions`(question/answer 배열)을 기록합니다. `published`, `consent: true`, 실제 인터뷰 날짜를 갖춘 항목만 공개됩니다. 인터뷰 사진에도 공개 동의와 대체 텍스트가 필요합니다.

Google Sheets 조사표에는 식당 ID·지점·주소·좌표·메뉴 ID·메뉴명·가격·재료·유형·확인 방법·출처·확인일·교차접촉·검수 상태를 기록하세요. 내부 조사표에서 검수한 값을 JSON에 반영합니다. `src/config.js`에 실제 Forms URL을 연결하며 제보는 검수 후 수동 반영합니다.

반영 전 `npm test`, `npm run build`를 실행합니다. PDF 재추출은 자료 가져오기용이며, 수동으로 최신화한 내용을 덮어쓰지 않도록 변경을 먼저 보존하고 차이를 검토하세요.
